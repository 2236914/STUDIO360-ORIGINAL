'use client';

import { ChatWidget } from 'src/components/chat-widget/chat-widget';

// ----------------------------------------------------------------------

export function ChatWidgetWrapper({ storeName }) {
  return <ChatWidget storeName={storeName} />;
}
