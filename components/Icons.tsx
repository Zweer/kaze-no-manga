import type { ImageProps } from 'next/image';

import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import {
  LuLoaderCircle,
  LuMoon,
  LuPencil,
  LuSun,
  LuUser,
} from 'react-icons/lu';

import config from '@/lib/config';
import { cn } from '@/lib/utils';

export default {
  logo(props?: Partial<ImageProps>) {
    return (
      <>
        <Image
          {...props}
          src="/logo/logo-light.png"
          alt={config.name}
          height={32}
          width={32}
          className={cn(
            'rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0',
            props?.className,
          )}
        />

        <Image
          {...props}
          src="/logo/logo-dark.png"
          alt={config.name}
          height={32}
          width={32}
          className={cn(
            'absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100',
            props?.className,
          )}
        />
      </>
    );
  },

  spinner: LuLoaderCircle,

  sun: LuSun,
  moon: LuMoon,

  google: FcGoogle,

  user: LuUser,
  edit: LuPencil,
};
