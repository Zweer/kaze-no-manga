import { Link } from '@heroui/react';
import React from 'react';
import { FaGithub } from 'react-icons/fa';

export default function FooterSocial() {
  const socials = [{ name: 'GitHub', href: 'https://github.com/zweer', icon: <FaGithub /> }];

  return (
    <div className="flex md:order-2 items-center gap-1">
      {socials.map(({ name, href, icon }) => (
        <Link key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
          {icon}
        </Link>
      ))}
    </div>
  );
}
