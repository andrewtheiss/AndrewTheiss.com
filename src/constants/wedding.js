// People who can see and edit the shared wedding to-do list.
// TODO: replace the placeholder with Mom's sign-in email (and mirror it in firestore.rules).
export const WEDDING_TODO_EDITORS = [
  'andrew.theiss@gmail.com',
  'MOM_EMAIL@example.com',
];

export const canEditWeddingTodos = (email) =>
  Boolean(email) && WEDDING_TODO_EDITORS.includes(email.toLowerCase());
