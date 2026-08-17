import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Project } from '@/app/projects/data';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { name, href, previewImage } = project;

  return (
    <Link href={href} rel='noopener noreferrer' target='_blank' className='group flex flex-col'>
      <text className='pb-3 font-bold text-xl text-neutral-100 group-hover:underline'>
        {name}
      </text>

      <AspectRatio ratio={16 / 9}>
        <Image
          src={previewImage}
          alt={name}
          fill
          className='rounded-md object-cover border-2 border-neutral-800'
        />
      </AspectRatio>
    </Link>
  );
};
