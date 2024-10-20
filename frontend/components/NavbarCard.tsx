import { Card, CardBody, Heading, Text } from '@chakra-ui/react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

export interface NavbarCardProps {
  imageSrc: StaticImageData;
  title: string;
  description: string;
  route: string;
}

export default function NavbarCards({ imageSrc, title, description, route }: NavbarCardProps) {
  return (
    <Link href={route} passHref>
      <Card
        direction={{ base: 'column', sm: 'row' }}
        boxShadow="none"
        _hover={{ cursor: 'pointer' }}
      >
        <Image
          src={imageSrc}
          alt={title}
          height={70}
          style={{ objectFit: 'contain' }}
        />
        <CardBody>
          <Heading size='md'>{title}</Heading>
          <Text py='2'>{description}</Text>
        </CardBody>
      </Card>
    </Link>
  );
}
