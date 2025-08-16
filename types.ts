export enum TargetType {
  EMAIL = 'Email',
  DOMAIN = 'Nom de domaine',
  IP = 'Adresse IP',
}

export interface WhoisData {
  domainName: string;
  registrar: string;
  creationDate: string;
  expiryDate: string;
  updatedDate: string;
  nameServers: string[];
  registrant?: { name: string; organization: string; };
}

export interface NayData {
  target: string;
  location: { city: string; country: string; };
  hosting: { provider: string; asn: string; };
  openPorts: { port: number; service: string; }[];
  sslCertificate: { issuer: string; subject: string; validFrom: string; validTo: string; } | null;
  technologies: string[];
  dnsRecords: { A: string[]; AAAA: string[]; MX: string[]; };
}

export interface BedaData {
  fileName: string;
  fileSize: string;
  image?: { [key: string]: { description: string } };
  exif?: { [key: string]: { description: string } };
  gps?: { Latitude?: number; Longitude?: number };
}

export interface EmailData {
  email: string;
  isValidSyntax: boolean;
  domain: string;
  hasMxRecords: boolean;
  breaches: { source: string; date: string; }[] | null;
  socialProfiles: { platform: string; url: string; }[] | null;
}

export interface FiraFinding {
    description: string;
    status: 'positive' | 'negative' | 'warning';
}

export interface FiraData {
    reliability: 'Élevée' | 'Moyenne' | 'Faible' | 'High' | 'Medium' | 'Low';
    summary: string;
    findings: FiraFinding[];
}


export type AnalysisResultData = WhoisData | NayData | EmailData | BedaData;

export type AnalysisResult =
  | { type: 'whois'; data: WhoisData }
  | { type: 'nay'; data: NayData }
  | { type: 'beda'; data: BedaData }
  | { type: 'email'; data: EmailData }
  | null;

export type Language = 'fr' | 'en';

export interface TranslationTree {
  [key: string]: string | TranslationTree;
}

export type Translations = {
  [key in Language]: TranslationTree;
};
