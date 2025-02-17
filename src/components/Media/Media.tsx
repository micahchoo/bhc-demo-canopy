import React from 'react';

interface MediaProps {
  title: string;
  description: string;
  thumbnail: string;
  id: string;
}

const Media: React.FC<MediaProps> = ({ title, description, thumbnail, id }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <img src={thumbnail} alt={title} />
      <a href={id}>View Media</a>
    </div>
  );
};

export default Media;
