import { collection, addDoc, deleteDoc, doc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export type Option = {
  id?: string;
  name: string;
  createdAt?: any;
};

export async function getOptions(): Promise<Option[]> {
  const q = await getDocs(collection(db, 'wheel_options'));
  const result = q.docs.map((d) => {
    const data = d.data() as Option;
    data.id = d.id;
    return data;
  });
  return result; 
}

export async function createOption(name: string) {
  const ref = await addDoc(collection(db, 'wheel_options'), { name, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteOption(name: string) {
  const q = query(collection(db, 'wheel_options'), where('name', '==', name));
  const docs = await getDocs(q);
  if (!docs.empty) {
    await deleteDoc(doc(db, 'wheel_options', docs.docs[0].id));
  }
}

export async function createManyOptions(names: string[]) {
  await Promise.all(
    names.map((name) =>
      addDoc(collection(db, 'wheel_options'), { name: name.trim(), createdAt: serverTimestamp() })
    )
  );
}
