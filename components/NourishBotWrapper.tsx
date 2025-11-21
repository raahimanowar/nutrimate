'use client';

import { useUserInfo } from '@/lib/context/UserContext';
import NourishBot from './NourishBot';

const NourishBotWrapper = () => {
  const { user } = useUserInfo();

  // Only render the chatbot if the user is logged in
  if (!user || !user.username) {
    return null;
  }

  return <NourishBot username={user.username} />;
};

export default NourishBotWrapper;
