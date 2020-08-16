import { byTextAscending, byTextDescending } from '../utils';

type CharacterType = {
  firstName: string;
  lastName: string;
};

const characters: CharacterType[] = [
  {
    firstName: 'Gimli',
    lastName: 'Gloin',
  },
  {
    firstName: 'Legolas',
    lastName: 'Greenleaf',
  },
  {
    firstName: 'Aragorn',
    lastName: 'Elessar',
  },
  {
    firstName: 'Gandalf',
    lastName: 'The Grey',
  },
  {
    firstName: 'Gimli',
    lastName: 'Gloin',
  },
];

test('Should sort characters by first name ascending', () => {
  const sortedCharacters = characters.sort(
    byTextAscending((character: CharacterType) => character.firstName)
  );

  expect((sortedCharacters[0] = { firstName: 'Aragorn', lastName: 'Elessar' }));
});

test('Should sort characters by last name descending', () => {
  const sortedCharacters = characters.sort(
    byTextDescending((character: CharacterType) => character.lastName)
  );

  expect(
    (sortedCharacters[0] = { firstName: 'Legolas', lastName: 'Greenleaf' })
  );
});
