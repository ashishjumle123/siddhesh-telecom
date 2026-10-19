const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

const buildOrderSummaryHtml = (orderItems, deliveryAddress, totalPrice, orderId) => {
    let itemsHtml = orderItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Order Total:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold;">₹${totalPrice}</td>
                    </tr>
                </tfoot>
            </table>
            
            <h3 style="margin-top: 30px; color: #444;">Delivery details</h3>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                ${deliveryAddress.address}<br>
                ${deliveryAddress.city} - ${deliveryAddress.pincode}
            </p>
        </div>
    `;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, paymentStatus, paymentResult, itemsPrice, shippingPrice, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const isPaid = paymentStatus === 'Completed' || paymentStatus === 'Paid' ? true : false;
        const finalPaymentStatus = isPaid ? 'Paid' : (paymentStatus || 'Pending');

        const order = new Order({
            orderItems,
            user: req.user._id,
            userDetails: {
                name: req.user.name || 'Customer',
                email: req.user.email,
                phone: shippingAddress.phone
            },
            shippingAddress,
            paymentMethod,
            paymentStatus: finalPaymentStatus,
            paymentResult,
            itemsPrice,
            shippingPrice,
            totalPrice,
            isPaid,
            paidAt: isPaid ? Date.now() : undefined
        });

        const createdOrder = await order.save();

        // Send email notification dynamically via reusable utility
        const orderSummaryHtml = buildOrderSummaryHtml(createdOrder.orderItems, createdOrder.shippingAddress, createdOrder.totalPrice, createdOrder.orderId);
        await sendEmail({
            email: req.user.email,
            subject: `Order Confirmed - ${createdOrder.orderId}`,
            html: `
                <h2 style="color: #28a745;">Order Confirmed!</h2>
                <p>Thank you for shopping with Siddhesh Telecome Services.</p>
                ${orderSummaryHtml}
            `,
            text: `Your order ${createdOrder.orderId} of ₹${createdOrder.totalPrice} is confirmed.`
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            // Check if user is admin or the order belongs to this user
            if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

        const statusToUpdate = orderStatus || req.body.status;

        if (!validStatuses.includes(statusToUpdate)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = statusToUpdate;
            if (statusToUpdate === 'Shipped' && !order.trackingId) {
                const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase();
                order.trackingId = `TRK${randomStr}`;
            }
            if (statusToUpdate === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
                if (order.paymentMethod === 'COD') {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.paymentStatus = 'Paid';
                }
            }
            const updatedOrder = await order.save();

            // Auto-trigger appropriate emails based on the progression to 'Shipped' or 'Delivered'
            if (statusToUpdate === 'Shipped') {
                const emailHtml = buildOrderSummaryHtml(updatedOrder.orderItems, updatedOrder.shippingAddress, updatedOrder.totalPrice, updatedOrder.orderId);
                await sendEmail({
                    email: updatedOrder.userDetails.email,
                    subject: `Your Order is Shipped - ${updatedOrder.orderId}`,
                    html: `
                        <h2 style="color: #17a2b8;">Good news! Your order is shipped.</h2>
                        <p>Your package is on its way. Track your delivery quickly in your profile under 'My Orders'.</p>
                        <p><strong>Tracking ID:</strong> ${updatedOrder.trackingId}</p>
                        ${emailHtml}
                    `,
                    text: `Your order ${updatedOrder.orderId} has been shipped!`
                });
            } else if (statusToUpdate === 'Delivered') {
                const emailHtml = buildOrderSummaryHtml(updatedOrder.orderItems, updatedOrder.shippingAddress, updatedOrder.totalPrice, updatedOrder.orderId);
                await sendEmail({
                    email: updatedOrder.userDetails.email,
                    subject: `Your Order is Delivered - ${updatedOrder.orderId}`,
                    html: `
                        <h2 style="color: #28a745;">Your package has arrived!</h2>
                        <p>We've successfully delivered your order. We hope you enjoy your purchase.</p>
                        ${emailHtml}
                    `,
                    text: `Your order ${updatedOrder.orderId} has been successfully delivered!`
                });
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check ownership: Only the order user or an Admin can cancel it
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to cancel this order' });
        }

        const validStatusesForCancel = ['Placed', 'Confirmed', 'Packed'];

        // Prevent cancelling if the order is already far along or already cancelled
        if (!validStatusesForCancel.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an order that has already been ${order.orderStatus.toLowerCase()}`
            });
        }

        // Update the status to Cancelled
        order.orderStatus = 'Cancelled';

        // Payment status rollback if applicable
        if (order.paymentStatus === 'Paid') {
            order.paymentStatus = 'Refunded'; // Or map refund logically depending on Razorpay needs
        }

        // Restore Stock for all items immediately upon cancellation
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stockQuantity += item.quantity;
                await product.save({ validateBeforeSave: false }); // Skip validators to quickly sync stock numbers back
            }
        }

        await order.save();

        res.json({ success: true, message: 'Order cancelled successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
