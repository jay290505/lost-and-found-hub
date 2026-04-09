import { Department } from './types';

export const DEPARTMENTS: Department[] = [
  {
    label: "B.Tech / Engineering",
    options: [
      "B.Tech - Computer",
      "B.Tech - Electrical",
      "B.Tech - Civil",
      "B.Tech - Mechanical",
      "B.Tech - IT",
    ],
  },
  {
    label: "Diploma",
    options: [
      "Diploma - Computer",
      "Diploma - Civil",
      "Diploma - Mechanical",
      "Diploma - Electrical",
      "Diploma - Automobile",
    ],
  },
  {
    label: "Pharmacy / FOHS",
    options: ["B.Pharm", "M.Pharm", "PhD"],
  },
  {
    label: "Business",
    options: ["BBA", "B.Com", "MBA", "IMBA"],
  },
  {
    label: "Biotechnology",
    options: [
      "Biotech - Chemistry",
      "Biotech - Industrial Chemistry",
      "Biotech - Mathematics",
      "Biotech - Microbiology",
    ],
  },
];

export const ALL_DEPARTMENTS: string[] = DEPARTMENTS.flatMap(d => d.options);
