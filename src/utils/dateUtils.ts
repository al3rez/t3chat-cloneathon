export function groupChatsByDate(chats: Array<{ createdAt: Date }>) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups = {
    today: [] as typeof chats,
    yesterday: [] as typeof chats,
    lastWeek: [] as typeof chats,
    lastMonth: [] as typeof chats,
    older: [] as typeof chats
  };

  chats.forEach(chat => {
    const chatDate = new Date(chat.createdAt);
    
    if (chatDate >= today) {
      groups.today.push(chat);
    } else if (chatDate >= yesterday) {
      groups.yesterday.push(chat);
    } else if (chatDate >= lastWeek) {
      groups.lastWeek.push(chat);
    } else if (chatDate >= lastMonth) {
      groups.lastMonth.push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  }).format(date);
}