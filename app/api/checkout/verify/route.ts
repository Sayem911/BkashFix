// Remove customer notifications and keep only admin notifications
const adminUsers = await User.find({ role: 'admin' });
await Promise.all(adminUsers.map(admin => 
  sendNotification({
    userId: admin._id.toString(),
    title: 'New Order Received',
    message: `Order #${orderNumber} has been placed for ${formatCurrency(order.total, 'USD')}.`,
    type: 'order',
    metadata: {
      orderId: order._id,
      orderNumber,
      amount: order.total,
      customerId: payment.metadata.userId
    }
  })
));

// Send notification to reseller if order is in their store
if (order.reseller) {
  await sendNotification({
    userId: order.reseller.toString(),
    title: 'New Order Received',
    message: `You have received a new order #${orderNumber} worth ${formatCurrency(order.total, 'USD')}.`,
    type: 'order',
    metadata: {
      orderId: order._id,
      orderNumber,
      amount: order.total
    }
  });
}