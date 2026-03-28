const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatINR = (value) => inrFormatter.format(Number(value) || 0);

const toDayKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

const isSameMonth = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();

export const getAdminMetrics = (bookings, currentUser) => {
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const now = new Date();
  const todayKey = toDayKey(now);

  const last7Days = [];
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(todayStart);
    d.setDate(todayStart.getDate() - i);
    last7Days.push(d);
  }

  const revenueByDay = Object.fromEntries(
    last7Days.map((d) => [d.toISOString().split('T')[0], 0])
  );

  const slotUsage = {};
  const usersMap = new Map();
  let paidCount = 0;
  let pendingCount = 0;
  let totalRevenue = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;

  safeBookings.forEach((booking) => {
    const amount = Number(booking.amount) || 0;
    const bookingDate = booking.createdAt ? new Date(booking.createdAt) : null;
    const bookingDay = toDayKey(booking.createdAt);
    const isPaid = Boolean(booking.paid);
    const userName = booking.user || booking.userName || 'Guest User';
    const userEmail = booking.userEmail || booking.email || '';
    const userKey = userEmail || userName;

    if (userKey) {
      if (!usersMap.has(userKey)) {
        usersMap.set(userKey, {
          id: userKey,
          name: userName,
          email: userEmail || 'NA',
          registered:
            bookingDate && !Number.isNaN(bookingDate.getTime())
              ? bookingDate.toLocaleDateString('en-IN')
              : 'NA',
          status: 'Active',
        });
      }
    }

    if (booking.slot) {
      slotUsage[booking.slot] = (slotUsage[booking.slot] || 0) + 1;
    }

    if (isPaid) {
      paidCount += 1;
      totalRevenue += amount;
      if (bookingDay && revenueByDay[bookingDay] !== undefined) {
        revenueByDay[bookingDay] += amount;
      }
      if (bookingDay === todayKey) {
        todayRevenue += amount;
      }
      if (bookingDate && !Number.isNaN(bookingDate.getTime()) && isSameMonth(bookingDate, now)) {
        monthRevenue += amount;
      }
    } else {
      pendingCount += 1;
    }
  });

  if (currentUser?.name || currentUser?.email) {
    const key = currentUser.email || currentUser.name;
    if (!usersMap.has(key)) {
      usersMap.set(key, {
        id: key,
        name: currentUser.name || 'Current User',
        email: currentUser.email || 'NA',
        registered: 'NA',
        status: 'Active',
      });
    }
  }

  const bookingsRows = safeBookings
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((booking) => ({
      id: booking.id,
      user: booking.user || booking.userEmail || 'Guest User',
      slot: booking.slot || '-',
      duration: `${booking.duration || 0}h`,
      amount: formatINR(booking.amount || 0),
      status: booking.paid ? 'Paid' : 'Pending',
    }));

  const usersRows = Array.from(usersMap.values());

  const weeklyRevenue = last7Days.map((d) => ({
    label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    value: revenueByDay[d.toISOString().split('T')[0]] || 0,
  }));

  const slotColumns = Object.entries(slotUsage)
    .map(([slot, count]) => ({ label: slot, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    paidCount,
    pendingCount,
    bookingsCount: safeBookings.length,
    totalRevenue,
    todayRevenue,
    monthRevenue,
    usersCount: usersRows.length,
    weeklyRevenue,
    usersRows,
    bookingsRows,
    slotColumns,
    paymentSplit: [
      { label: 'Paid', value: paidCount, color: '#10b981' },
      { label: 'Pending', value: pendingCount, color: '#f59e0b' },
    ],
  };
};
