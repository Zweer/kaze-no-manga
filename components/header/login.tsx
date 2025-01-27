import {
  Button,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NavbarItem,
  useDisclosure,
} from '@heroui/react';
import { signIn } from 'next-auth/react';
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { GoPasskeyFill } from 'react-icons/go';

export default function HeaderNavbarProfileLogin() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <NavbarItem>
        <Button color="primary" variant="flat" onPress={onOpen}>
          Login
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Social Login</ModalHeader>

                <ModalBody>
                  <div className="flex flex-col gap-2">
                    <Button
                      startContent={<FcGoogle width={24} />}
                      variant="bordered"
                      onPress={() => signIn('google') as unknown as void}
                    >
                      Continue with Google
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <Divider className="flex-1" />
                    <p className="shrink-0 text-tiny text-default-500">OR</p>
                    <Divider className="flex-1" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      startContent={<GoPasskeyFill width={24} />}
                      variant="bordered"
                      onPress={() => signIn('passkey') as unknown as void}
                    >
                      Sign in with Passkey
                    </Button>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </NavbarItem>
    </>
  );
}
