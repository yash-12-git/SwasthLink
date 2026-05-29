export interface Department {
  id: string;
  name: string;
  nameHi: string;          // Hindi name
  icon: string;            // lucide icon name
  color: string;
  bg: string;
  activeQueue?: number;    // patients currently waiting
  avgWaitMins?: number;    // estimated wait
}
