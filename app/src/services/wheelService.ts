import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type OptionSet = {
  id?: string;
  name: string;
  options: string[];
  createdAt?: any;
};

export function listenOptionSets(cb: (sets: OptionSet[]) => void) {
  const q = query(collection(db, 'wheel_option_sets'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const sets = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(sets as OptionSet[]);
  });
}

export async function createOptionSet(name: string, options: string[]) {
  const ref = await addDoc(collection(db, 'wheel_option_sets'), { name, options, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteOptionSet(id: string) {
  await deleteDoc(doc(db, 'wheel_option_sets', id));
}
