import { GoogleGenAI, Type } from "@google/genai";
import { WhoisData, NayData, EmailData, FiraData, AnalysisResultData } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const whoisSchema = {
    type: Type.OBJECT,
    properties: {
        domainName: { type: Type.STRING },
        registrar: { type: Type.STRING },
        creationDate: { type: Type.STRING },
        expiryDate: { type: Type.STRING },
        updatedDate: { type: Type.STRING },
        nameServers: { type: Type.ARRAY, items: { type: Type.STRING } },
        registrant: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                organization: { type: Type.STRING }
            }
        }
    },
    required: ["domainName", "registrar", "creationDate", "expiryDate", "updatedDate", "nameServers"]
};

const naySchema = {
    type: Type.OBJECT,
    properties: {
        target: { type: Type.STRING },
        location: {
            type: Type.OBJECT,
            properties: {
                city: { type: Type.STRING },
                country: { type: Type.STRING }
            },
            required: ["city", "country"]
        },
        hosting: {
            type: Type.OBJECT,
            properties: {
                provider: { type: Type.STRING },
                asn: { type: Type.STRING }
            },
            required: ["provider", "asn"]
        },
        openPorts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    port: { type: Type.INTEGER },
                    service: { type: Type.STRING }
                },
                required: ["port", "service"]
            }
        },
        sslCertificate: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                issuer: { type: Type.STRING },
                subject: { type: Type.STRING },
                validFrom: { type: Type.STRING },
                validTo: { type: Type.STRING }
            }
        },
        technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        dnsRecords: {
            type: Type.OBJECT,
            properties: {
                A: { type: Type.ARRAY, items: { type: Type.STRING } },
                AAAA: { type: Type.ARRAY, items: { type: Type.STRING } },
                MX: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
    },
    required: ["target", "location", "hosting", "openPorts", "sslCertificate", "technologies", "dnsRecords"]
};

const emailInfoSchema = {
    type: Type.OBJECT,
    properties: {
        email: { type: Type.STRING },
        isValidSyntax: { type: Type.BOOLEAN },
        domain: { type: Type.STRING },
        hasMxRecords: { type: Type.BOOLEAN },
        breaches: {
            type: Type.ARRAY,
            nullable: true,
            items: {
                type: Type.OBJECT,
                properties: {
                    source: { type: Type.STRING },
                    date: { type: Type.STRING },
                },
                required: ["source", "date"]
            }
        },
        socialProfiles: {
            type: Type.ARRAY,
            nullable: true,
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING },
                    url: { type: Type.STRING },
                },
                required: ["platform", "url"]
            }
        }
    },
    required: ["email", "isValidSyntax", "domain", "hasMxRecords", "breaches", "socialProfiles"]
};

const firaSchema = {
    type: Type.OBJECT,
    properties: {
        reliability: {
            type: Type.STRING,
            enum: ['Élevée', 'Moyenne', 'Faible', 'High', 'Medium', 'Low'],
            description: "Overall reliability score"
        },
        summary: {
            type: Type.STRING,
            description: "A brief summary of the reliability analysis."
        },
        findings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['positive', 'negative', 'warning'] }
                },
                required: ['description', 'status']
            }
        }
    },
    required: ['reliability', 'summary', 'findings']
};


export const getWhoisInfo = async (domain: string): Promise<WhoisData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a WHOIS lookup for the domain: ${domain}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: whoisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as WhoisData;
    } catch (error) {
        console.error("Error fetching WHOIS data from Gemini:", error);
        throw new Error("Failed to fetch WHOIS data.");
    }
};

export const getNetworkInfo = async (target: string): Promise<NayData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a detailed network analysis for the target (IP or domain): ${target}. Provide open ports, SSL info, detected technologies, DNS records, hosting provider, and server location.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: naySchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as NayData;
    } catch (error) {
        console.error("Error fetching Network data from Gemini:", error);
        throw new Error("Failed to fetch Network data.");
    }
};

export const getEmailInfo = async (email: string): Promise<EmailData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the email address "${email}". Check for syntax validity, domain MX records, presence in known data breaches, and associated public social media profiles. Provide sources and dates for breaches, and URLs for social profiles.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: emailInfoSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as EmailData;
    } catch (error) {
        console.error("Error fetching Email data from Gemini:", error);
        throw new Error("Failed to fetch Email data.");
    }
};

export const getFiraAnalysis = async (dataToAnalyze: AnalysisResultData): Promise<FiraData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following OSINT data for reliability and inconsistencies. Provide a reliability score (Élevée, Moyenne, or Faible), a summary, and specific findings with a status (positive, negative, warning). Data: ${JSON.stringify(dataToAnalyze, null, 2)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: firaSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FiraData;
    } catch (error) {
        console.error("Error fetching FIRA data from Gemini:", error);
        throw new Error("Failed to fetch FIRA data.");
    }
};