import { extendVariants, Modal as BaseModal } from '@heroui/react';

export const Modal = extendVariants(BaseModal, {
  defaultVariants: {
    backdrop: 'bg-primary/50',
    base: '',
  },
});
