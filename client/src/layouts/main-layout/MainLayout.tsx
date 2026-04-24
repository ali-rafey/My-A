import { type ReactNode } from 'react';
import Navbar from '../../components/navbar/Navbar';
import styles from './MainLayout.module.css';

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Navbar />
      <main className={styles.main}>{children}</main>
    </>
  );
}
