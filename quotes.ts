export interface Quote {
  text: string;
  author: string;
  category: 'motivational' | 'inspirational' | 'selfcare' | 'productivity' | 'wisdom';
}

export const QUOTES: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivational" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivational" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
  { text: "Small steps every day lead to big results.", author: "Unknown", category: "motivational" },
  { text: "Your future is created by what you do today.", author: "Robert Kiyosaki", category: "motivational" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "wisdom" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "inspirational" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivational" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "motivational" },
  { text: "The mind is everything. What you think you become.", author: "Buddha", category: "wisdom" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "motivational" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott", category: "selfcare" },
  { text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", author: "Ralph Marston", category: "selfcare" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: "selfcare" },
  { text: "Be where you are, not where you think you should be.", author: "Unknown", category: "selfcare" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "productivity" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer", category: "productivity" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "productivity" },
  { text: "Until we can manage time, we can manage nothing else.", author: "Peter Drucker", category: "productivity" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Goethe", category: "wisdom" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "wisdom" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss", category: "wisdom" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "wisdom" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma", category: "inspirational" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "inspirational" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "inspirational" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "inspirational" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivational" },
  { text: "You are enough just as you are.", author: "Meghan Markle", category: "selfcare" },
  { text: "Deep breathing is our nervous system's love language.", author: "Dr. Lauren Fogel Mersy", category: "selfcare" },
];

export function getRandomQuote(category?: string): Quote {
  const filtered = category && category !== 'all'
    ? QUOTES.filter(q => q.category === category)
    : QUOTES;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
