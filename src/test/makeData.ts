import { ColumnType, DataType } from 'types';
import { date } from 'faker';

// from json-generator.com
const randomData = [
  {
    id: 0,
    isActive: false,
    age: 37,
    eyeColor: 'blue',
    firstName: 'Yesenia',
    lastName: 'Lawson',
    company: 'ZILIDIUM',
    email: 'yesenia.lawson@zilidium.info',
    phone: '+1 (875) 550-3760',
    address: '316 Ashford Street, Beaulieu, North Dakota, 271',
  },
  {
    id: 1,
    isActive: true,
    age: 21,
    eyeColor: 'blue',
    firstName: 'Graves',
    lastName: 'Horton',
    company: 'PATHWAYS',
    email: 'graves.horton@pathways.me',
    phone: '+1 (902) 479-2362',
    address: '911 Bridgewater Street, Cornucopia, South Carolina, 421',
  },
  {
    id: 2,
    isActive: true,
    age: 37,
    eyeColor: 'brown',
    firstName: 'Faulkner',
    lastName: 'Atkins',
    company: 'LIQUICOM',
    email: 'faulkner.atkins@liquicom.org',
    phone: '+1 (843) 537-2974',
    address: '855 Newel Street, Fairhaven, Nevada, 8662',
  },
  {
    id: 3,
    isActive: true,
    age: 40,
    eyeColor: 'blue',
    firstName: 'Leta',
    lastName: 'Boone',
    company: 'BILLMED',
    email: 'leta.boone@billmed.name',
    phone: '+1 (867) 547-3179',
    address: '386 Chauncey Street, Enoree, Puerto Rico, 5236',
  },
  {
    id: 4,
    isActive: true,
    age: 31,
    eyeColor: 'brown',
    firstName: 'Kennedy',
    lastName: 'Coffey',
    company: 'PLUTORQUE',
    email: 'kennedy.coffey@plutorque.co.uk',
    phone: '+1 (837) 540-2312',
    address: '282 Truxton Street, Saticoy, Massachusetts, 2538',
  },
  {
    id: 5,
    isActive: false,
    age: 39,
    eyeColor: 'green',
    firstName: 'Jolene',
    lastName: 'Barrett',
    company: 'BARKARAMA',
    email: 'jolene.barrett@barkarama.biz',
    phone: '+1 (935) 485-3684',
    address: '366 Baltic Street, Eden, Oklahoma, 1031',
  },
  {
    id: 6,
    isActive: false,
    age: 31,
    eyeColor: 'blue',
    firstName: 'Kendra',
    lastName: 'Valentine',
    company: 'ZOID',
    email: 'kendra.valentine@zoid.ca',
    phone: '+1 (837) 570-3275',
    address: '200 Locust Street, Dowling, Louisiana, 4119',
  },
  {
    id: 7,
    isActive: true,
    age: 20,
    eyeColor: 'green',
    firstName: 'Payne',
    lastName: 'Lowe',
    company: 'EDECINE',
    email: 'payne.lowe@edecine.us',
    phone: '+1 (835) 514-2796',
    address: '121 Doone Court, Dubois, American Samoa, 5778',
  },
  {
    id: 8,
    isActive: false,
    age: 40,
    eyeColor: 'blue',
    firstName: 'Holden',
    lastName: 'Hill',
    company: 'CABLAM',
    email: 'holden.hill@cablam.tv',
    phone: '+1 (856) 411-2549',
    address: '798 Keap Street, Wheatfields, North Carolina, 4412',
  },
  {
    id: 9,
    isActive: false,
    age: 28,
    eyeColor: 'brown',
    firstName: 'Sheila',
    lastName: 'Smith',
    company: 'UNCORP',
    email: 'sheila.smith@uncorp.net',
    phone: '+1 (819) 470-2493',
    address: '160 Bliss Terrace, Waterford, Michigan, 1819',
  },
  {
    id: 10,
    isActive: true,
    age: 33,
    eyeColor: 'brown',
    firstName: 'Francine',
    lastName: 'Gordon',
    company: 'INSECTUS',
    email: 'francine.gordon@insectus.io',
    phone: '+1 (824) 492-2280',
    address: '738 Losee Terrace, Salvo, Kentucky, 7451',
  },
  {
    id: 11,
    isActive: false,
    age: 39,
    eyeColor: 'brown',
    firstName: 'Moses',
    lastName: 'Olson',
    company: 'DECRATEX',
    email: 'moses.olson@decratex.com',
    phone: '+1 (834) 533-3431',
    address: '350 Doughty Street, Bakersville, Arkansas, 5587',
  },
  {
    id: 12,
    isActive: false,
    age: 31,
    eyeColor: 'green',
    firstName: 'Lamb',
    lastName: 'Cleveland',
    company: 'GADTRON',
    email: 'lamb.cleveland@gadtron.info',
    phone: '+1 (852) 509-3406',
    address: '829 Hutchinson Court, Reno, West Virginia, 2423',
  },
  {
    id: 13,
    isActive: true,
    age: 29,
    eyeColor: 'blue',
    firstName: 'Odom',
    lastName: 'Massey',
    company: 'ENERSAVE',
    email: 'odom.massey@enersave.me',
    phone: '+1 (930) 531-2122',
    address: '801 Stuart Street, Helen, Guam, 4847',
  },
  {
    id: 14,
    isActive: true,
    age: 34,
    eyeColor: 'brown',
    firstName: 'Brennan',
    lastName: 'Hampton',
    company: 'MEMORA',
    email: 'brennan.hampton@memora.org',
    phone: '+1 (979) 461-3272',
    address: '117 Havens Place, Rivers, Indiana, 5202',
  },
  {
    id: 15,
    isActive: true,
    age: 36,
    eyeColor: 'brown',
    firstName: 'Naomi',
    lastName: 'Dudley',
    company: 'COMVEYOR',
    email: 'naomi.dudley@comveyor.name',
    phone: '+1 (861) 504-2276',
    address: '848 Hill Street, Springhill, Connecticut, 6929',
  },
  {
    id: 16,
    isActive: false,
    age: 27,
    eyeColor: 'brown',
    firstName: 'Gwen',
    lastName: 'Vega',
    company: 'LETPRO',
    email: 'gwen.vega@letpro.co.uk',
    phone: '+1 (923) 518-3616',
    address: '101 Lafayette Walk, Caledonia, Utah, 2627',
  },
  {
    id: 17,
    isActive: true,
    age: 20,
    eyeColor: 'green',
    firstName: 'Madelyn',
    lastName: 'Brennan',
    company: 'ACLIMA',
    email: 'madelyn.brennan@aclima.biz',
    phone: '+1 (970) 469-2832',
    address: '788 Kensington Street, Brewster, Tennessee, 5659',
  },
  {
    id: 18,
    isActive: true,
    age: 31,
    eyeColor: 'blue',
    firstName: 'Mattie',
    lastName: 'Guerra',
    company: 'MULTIFLEX',
    email: 'mattie.guerra@multiflex.ca',
    phone: '+1 (856) 600-3652',
    address: '190 Noel Avenue, Cliffside, Nebraska, 9889',
  },
  {
    id: 19,
    isActive: false,
    age: 34,
    eyeColor: 'blue',
    firstName: 'Josie',
    lastName: 'Delaney',
    company: 'KENGEN',
    email: 'josie.delaney@kengen.us',
    phone: '+1 (989) 455-3049',
    address: '513 Homecrest Court, Washington, Texas, 9075',
  },
  {
    id: 20,
    isActive: false,
    age: 34,
    eyeColor: 'blue',
    firstName: 'Joe',
    lastName: 'Delaney',
    company: 'KENGEN',
    email: 'joe.delaney@kengen.us',
    phone: '+1 (233) 455-3049',
    address: '232 Terrace Court, Washington, Texas, 2341',
  },
];

const columns = [
  {
    name: 'id',
    hidden: true,
  },
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  {
    name: 'isActive',
    label: 'Is Active',
    render: ({ value }: { value: boolean }) => (value ? 'Yes' : 'No'),
  },
  {
    name: 'age',
    label: 'Age',
  },
];

export type UserType = {
  id: number;
  isActive: boolean;
  age: number;
  eyeColor: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
};

export const makeData = <T extends Record<string, unknown>>(
  rowNum: number
): { columns: ColumnType<T>[]; data: UserType[] } => {
  return {
    columns,
    data: randomData.slice(0, rowNum),
  };
};

export const makeSimpleData = <T extends DataType>() => {
  const columns: ColumnType<T>[] = [
    {
      name: 'firstName',
      label: 'First Name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
    },
    {
      name: 'birthDate',
      label: 'Birth Date',
    },
  ];

  const recentDate = date.recent();
  const pastDate = date.past(undefined, recentDate);
  const oldestDate = date.past(100, pastDate);

  const data = [
    {
      firstName: 'Samwise',
      lastName: 'Gamgee',
      birthDate: pastDate.toISOString(),
    },
    {
      firstName: 'Frodo',
      lastName: 'Baggins',
      birthDate: recentDate.toISOString(), // must be youngest for tests
    },
    {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      birthDate: oldestDate.toISOString(),
    },
  ];
  return { columns, data };
};
