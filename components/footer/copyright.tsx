import React from 'react';

import { getCurrentYear } from '@/lib/time';

export default function FooterCopyright() {
  return (
    <div className="mt-4 md:order-1 md:mt-0">
      <p className="text-sm text-default-400">© {getCurrentYear()} Built with 💜 by Zweer</p>
    </div>
  );
}
