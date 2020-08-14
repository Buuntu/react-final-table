// export const compare = <T extends {[key: string]: value: any}>(a: T[], b: T[], column: string) => {
//   // Use toUpperCase() to ignore character casing
//   if (!(column in a) || !(column in b)) {
//     throw new Error('Invalid column');
//   }

//   if (column in a && column in b) {
//     const bandA = new String(a[column]).toUpperCase();
//     const bandB = b[column].toUpperCase();
//   }

//   let comparison = 0;
//   if (bandA > bandB) {
//     comparison = 1;
//   } else if (bandA < bandB) {
//     comparison = -1;
//   }
//   return comparison;
// };
