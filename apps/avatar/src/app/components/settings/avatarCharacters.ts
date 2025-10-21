// characterData.ts
type Styles = {
  [styleName: string]: string[];
};

type _CharacterData = {
  [characterName: string]: {
    styles: Styles;
  };
};

type AvatarStyle = {
  style: string;
  thumbnail: string;
};

type CharacterAvatar = {
  character: string;
  styles: AvatarStyle[];
};

type AvatarsList = CharacterAvatar[];

export type CharacterData = CharacterAvatar[];

export const characterData: CharacterData = [
  {
    character: 'harry',
    styles: [
      {
        style: 'business',
        thumbnail: '/assets/avatar/harry/harry-business-thumbnail.png',
      },
      {
        style: 'casual',
        thumbnail: '/assets/avatar/harry/harry-casual-thumbnail.png',
      },
      {
        style: 'youthful',
        thumbnail: '/assets/avatar/harry/harry-youthful-thumbnail.png',
      },
    ],
  },
  {
    character: 'jeff',
    styles: [
      {
        style: 'business',
        thumbnail: '/assets/avatar/jeff/jeff-business-thumbnail-bg.png',
      },
      {
        style: 'formal',
        thumbnail: '/assets/avatar/jeff/jeff-formal-thumbnail-bg.png',
      },
    ],
  },
  {
    character: 'lisa',
    styles: [
      {
        style: 'casual-sitting',
        thumbnail: '/assets/avatar/lisa/lisa-casual-sitting-thumbnail.png',
      },
    ],
  },
  {
    character: 'lori',
    styles: [
      {
        style: 'casual',
        thumbnail: '/assets/avatar/lori/lori-casual-thumbnail.png',
      },
      {
        style: 'formal',
        thumbnail: '/assets/avatar/lori/lori-formal-thumbnail.png',
      },
      {
        style: 'graceful',
        thumbnail: '/assets/avatar/lori/lori-graceful-thumbnail.png',
      },
    ],
  },
  {
    character: 'max',
    styles: [
      {
        style: 'business',
        thumbnail: '/assets/avatar/max/max-business-thumbnail.png',
      },
      {
        style: 'casual',
        thumbnail: '/assets/avatar/max/max-casual-thumbnail.png',
      },
      {
        style: 'formal',
        thumbnail: '/assets/avatar/max/max-formal-thumbnail.png',
      },
    ],
  },
  {
    character: 'meg',
    styles: [
      {
        style: 'business',
        thumbnail: '/assets/avatar/meg/meg-business-thumbnail.png',
      },
      {
        style: 'casual',
        thumbnail: '/assets/avatar/meg/meg-casual-thumbnail.png',
      },
      {
        style: 'formal',
        thumbnail: '/assets/avatar/meg/meg-formal-thumbnail.png',
      },
    ],
  },
];

export const _characterData: _CharacterData = {
  harry: {
    styles: {
      business: [
        '123',
        'calm-down',
        'come-on',
        'five-star-reviews',
        'good',
        'hello',
        'introduce',
        'invite',
        'thanks',
        'welcome',
      ],
      casual: [
        '123',
        'come-on',
        'five-star-reviews',
        'gong-xi-fa-cai',
        'good',
        'happy-new-year',
        'hello',
        'please',
        'welcome',
      ],
      youthful: [
        '123',
        'come-on',
        'down',
        'five-star',
        'good',
        'hello',
        'invite',
        'show-right-up-down',
        'welcome',
      ],
    },
  },
  jeff: {
    styles: {
      business: [
        '123',
        'come-on',
        'five-star-reviews',
        'hands-up',
        'here',
        'meddle',
        'please2',
        'show',
        'silence',
        'thanks',
      ],
      formal: [
        '123',
        'come-on',
        'five-star-reviews',
        'lift',
        'please',
        'silence',
        'thanks',
        'very-good',
      ],
    },
  },
  lisa: {
    styles: {
      'casual-sitting': [
        'numeric1-left-1',
        'numeric2-left-1',
        'numeric3-left-1',
        'thumbsup-left-1',
        'show-front-1',
        'show-front-2',
        'show-front-3',
        'show-front-4',
        'show-front-5',
        'think-twice-1',
        'show-front-6',
        'show-front-7',
        'show-front-8',
        'show-front-9',
      ],
      'graceful-sitting': [
        'wave-left-1',
        'wave-left-2',
        'thumbsup-left',
        'show-left-1',
        'show-left-2',
        'show-left-3',
        'show-left-4',
        'show-left-5',
        'show-right-1',
        'show-right-2',
        'show-right-3',
        'show-right-4',
        'show-right-5',
      ],
      'graceful-standing': [],
      'technical-sitting': [
        'wave-left-1',
        'wave-left-2',
        'show-left-1',
        'show-left-2',
        'point-left-1',
        'point-left-2',
        'point-left-3',
        'point-left-4',
        'point-left-5',
        'point-left-6',
        'show-right-1',
        'show-right-2',
        'show-right-3',
        'point-right-1',
        'point-right-2',
        'point-right-3',
        'point-right-4',
        'point-right-5',
        'point-right-6',
      ],
      'technical-standing': [],
    },
  },
};
