import { v4 as uuidv4 } from 'uuid';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { storage, db, auth } from './firebase';

export async function uploadImage(file: File) {
  const id = uuidv4();
  const uid = auth.currentUser?.uid || 'anon';
  const path = `uploads/${uid}/${id}_${file.name}`;
  const sRef = storageRef(storage, path);
  await uploadBytes(sRef, file);
  const url = await getDownloadURL(sRef);
  const docRef = await addDoc(collection(db, 'tierlist_items'), {
    filename: file.name,
    storagePath: path,
    downloadUrl: url,
    tier: null,
    order: null,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, filename: file.name, downloadUrl: url, tier: null };
}

export function listenToItems(cb: (items: any[]) => void) {
  const q = query(collection(db, 'tierlist_items'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(items);
  });
}

export async function updateItemTier(id: string, tier: string | null, order: number | null) {
  const refDoc = doc(db, 'tierlist_items', id);
  await updateDoc(refDoc, { tier, order });
}