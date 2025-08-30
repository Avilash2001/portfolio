export type Job = "Software Developer" | "UI/UX Designer" | "Digital Marketer";

export interface Skill {
  title: string;
  percentage: number;
  icon: string;
  color: string;
  iconBorder?: boolean;
}
