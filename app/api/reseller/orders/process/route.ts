// Remove customer notifications and keep only admin notifications
const adminUsers = await User.find({ role: 'admin' });
await Promise.all(adminUsers.map(admin => 
  sendNotification({
    userId: admin._id.toString(),
    title: 'New Order Update',
    message: `Reseller has started processing order #${order.orderNumber}.`,
    type: 'order',
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      resellerId: session.user.id,
      status: 'processing'
    }
  })
));