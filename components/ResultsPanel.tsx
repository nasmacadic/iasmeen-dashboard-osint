import React from 'react';
import { AnalysisResult, FiraData } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { LoaderIcon, ErrorIcon, ReportIcon, FiraIcon, PositiveIcon, NegativeIcon, WarningIcon } from './icons';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <h3 className="text-lg font-semibold text-purple-300 mb-3">{children}</h3>
);

const InfoRow: React.FC<{label: string, value: React.ReactNode}> = ({ label, value }) => (
    <div className="flex justify-between items-start py-2 border-b border-white/10">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-right text-sm font-medium">{value}</span>
    </div>
);

const WhoisResults: React.FC<{ data: AnalysisResult & { type: 'whois' } }> = ({ data }) => {
    const { t } = useLocalization();
    const whoisT = t('whois') as {[key: string]: string};
    const { domainName, registrar, creationDate, expiryDate, updatedDate, nameServers, registrant } = data.data;
    return (
        <Card>
            <CardTitle>{whoisT.title}</CardTitle>
            <InfoRow label={whoisT.domainName} value={domainName} />
            <InfoRow label={whoisT.registrar} value={registrar} />
            <InfoRow label={whoisT.creationDate} value={creationDate} />
            <InfoRow label={whoisT.expiryDate} value={expiryDate} />
            <InfoRow label={whoisT.updatedDate} value={updatedDate} />
            <InfoRow label={whoisT.nameServers} value={nameServers.join(', ')} />
            {registrant && (
                <>
                    <h4 className="text-md font-semibold text-purple-400 mt-4 mb-2">{whoisT.registrantInfo}</h4>
                    {registrant.name && <InfoRow label={whoisT.name} value={registrant.name} />}
                    {registrant.organization && <InfoRow label={whoisT.organization} value={registrant.organization} />}
                </>
            )}
        </Card>
    );
};

const NayResults: React.FC<{ data: AnalysisResult & { type: 'nay' } }> = ({ data }) => {
    const { t } = useLocalization();
    const nayT = t('nay') as {[key: string]: string};
    const { target, location, hosting, openPorts, sslCertificate, technologies, dnsRecords } = data.data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-2">
                <CardTitle>{nayT.title}</CardTitle>
                <InfoRow label={nayT.target} value={target} />
                <InfoRow label={nayT.location} value={`${location.city}, ${location.country}`} />
            </Card>
            <Card>
                <CardTitle>{nayT.hosting}</CardTitle>
                <InfoRow label={nayT.provider} value={hosting.provider} />
                <InfoRow label={nayT.asn} value={hosting.asn} />
            </Card>
            <Card>
                <CardTitle>{nayT.sslCertificate}</CardTitle>
                {sslCertificate ? (
                    <>
                        <InfoRow label={nayT.issuer} value={sslCertificate.issuer} />
                        <InfoRow label={nayT.subject} value={sslCertificate.subject} />
                        <InfoRow label={nayT.validFrom} value={sslCertificate.validFrom} />
                        <InfoRow label={nayT.validTo} value={sslCertificate.validTo} />
                    </>
                ) : <p className="text-gray-400">{nayT.noSsl}</p>}
            </Card>
            <Card>
                <CardTitle>{nayT.openPorts}</CardTitle>
                <div className="max-h-40 overflow-y-auto">
                    {openPorts.map(p => <InfoRow key={p.port} label={`${nayT.port} ${p.port}`} value={p.service} />)}
                </div>
            </Card>
            <Card>
                <CardTitle>{nayT.technologies}</CardTitle>
                <p className="text-purple-200 text-sm">{technologies.join(', ')}</p>
            </Card>
            <Card className="md:col-span-2">
                <CardTitle>{nayT.dnsRecords}</CardTitle>
                <InfoRow label="A" value={dnsRecords.A.join(', ')} />
                <InfoRow label="AAAA" value={dnsRecords.AAAA.join(', ')} />
                <InfoRow label="MX" value={dnsRecords.MX.join(', ')} />
            </Card>
        </div>
    );
};

const BedaResults: React.FC<{ data: AnalysisResult & { type: 'beda' } }> = ({ data }) => {
    const { t } = useLocalization();
    const bedaT = t('beda') as {[key: string]: string};
    const { fileName, fileSize, image, exif, gps } = data.data;

    const renderData = (obj: object | undefined) => {
        if (!obj) return null;
        return Object.entries(obj).map(([key, value]) => (
            value && value.description ? <InfoRow key={key} label={key} value={value.description} /> : null
        ));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-2">
                <CardTitle>{bedaT.title}</CardTitle>
                <InfoRow label={bedaT.fileName} value={fileName} />
                <InfoRow label={bedaT.fileSize} value={fileSize} />
            </Card>
            <Card>
                <CardTitle>{bedaT.imageProperties}</CardTitle>
                {renderData(image)}
            </Card>
            <Card>
                <CardTitle>{bedaT.gpsData}</CardTitle>
                {gps && typeof gps.Latitude === 'number' && typeof gps.Longitude === 'number' ? (
                    <>
                        <InfoRow label={bedaT.latitude} value={gps.Latitude.toFixed(6)} />
                        <InfoRow label={bedaT.longitude} value={gps.Longitude.toFixed(6)} />
                    </>
                ) : <p className="text-gray-400">{bedaT.noGps}</p>}
            </Card>
            <Card className="md:col-span-2">
                <CardTitle>{bedaT.exifData}</CardTitle>
                <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {renderData(exif)}
                </div>
            </Card>
        </div>
    );
};

const EmailResults: React.FC<{ data: AnalysisResult & { type: 'email' } }> = ({ data }) => {
    const { t } = useLocalization();
    const emailT = t('email') as {[key: string]: string};
    const { email, isValidSyntax, domain, hasMxRecords, breaches, socialProfiles } = data.data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="md:col-span-2">
                <CardTitle>{emailT.title}</CardTitle>
                <InfoRow label={emailT.emailAddress} value={email} />
                <InfoRow label={emailT.domain} value={domain} />
                <InfoRow label={emailT.syntaxValid} value={isValidSyntax ? emailT.yes : emailT.no} />
                <InfoRow label={emailT.mxRecordsFound} value={hasMxRecords ? emailT.yes : emailT.no} />
            </Card>

            <Card>
                <CardTitle>{emailT.dataBreaches}</CardTitle>
                {breaches && breaches.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                        {breaches.map((b, i) => <InfoRow key={i} label={b.source} value={b.date} />)}
                    </div>
                ) : <p className="text-gray-400 text-sm">{emailT.noBreaches}</p>}
            </Card>

            <Card>
                <CardTitle>{emailT.socialProfiles}</CardTitle>
                {socialProfiles && socialProfiles.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                        {socialProfiles.map((p, i) => <InfoRow key={i} label={p.platform} value={<a href={p.url} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:underline">{p.url}</a>} />)}
                    </div>
                ) : <p className="text-gray-400 text-sm">{emailT.noProfiles}</p>}
            </Card>
        </div>
    );
};

const FiraResults: React.FC<{ data: FiraData }> = ({ data }) => {
    const { t } = useLocalization();
    const firaT = t('fira') as { title: string, reliability: string, summary: string, findings: string, reliabilityLevels: { [key: string]: string } };

    const { reliability, summary, findings } = data;

    const reliabilityColor = {
        'Élevée': 'text-green-400',
        'Moyenne': 'text-yellow-400',
        'Faible': 'text-red-400',
        'High': 'text-green-400',
        'Medium': 'text-yellow-400',
        'Low': 'text-red-400',
    }[reliability];

    const findingIcons = {
        positive: <PositiveIcon className="w-5 h-5 text-green-400 flex-shrink-0" />,
        warning: <WarningIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />,
        negative: <NegativeIcon className="w-5 h-5 text-red-400 flex-shrink-0" />,
    };

    return (
        <>
            <InfoRow label={firaT.reliability} value={<span className={`font-bold ${reliabilityColor}`}>{firaT.reliabilityLevels[reliability]}</span>} />
            <div className="py-2 border-b border-white/10">
                <span className="text-gray-400 text-sm">{firaT.summary}</span>
                <p className="text-white text-sm font-medium mt-1">{summary}</p>
            </div>
             <div className="py-2">
                <span className="text-gray-400 text-sm">{firaT.findings}</span>
                 <ul className="mt-2 space-y-2">
                    {findings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-3">
                            {findingIcons[finding.status]}
                            <p className="text-white text-sm">{finding.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

interface ResultsPanelProps {
    result: AnalysisResult;
    isLoading: boolean;
    error: string | null;
    firaResult: FiraData | null;
    isFiraLoading: boolean;
    firaError: string | null;
    onFiraAnalysis: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, isLoading, error, firaResult, isFiraLoading, firaError, onFiraAnalysis }) => {
    const { t } = useLocalization();
    const firaT = t('fira') as { title: string, runAnalysis: string, loading: string };


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-purple-300">
                    <LoaderIcon className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-xl">{t('loading') as string}</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                    <ErrorIcon className="w-12 h-12 mb-4" />
                    <p className="text-xl">{t('error') as string}</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
            );
        }
        if (!result) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <ReportIcon className="w-12 h-12 mb-4" />
                    <p className="text-xl text-center">{t('noResults') as string}</p>
                </div>
            );
        }

        let mainResults;
        switch(result.type) {
            case 'whois': mainResults = <WhoisResults data={result} />; break;
            case 'nay': mainResults = <NayResults data={result} />; break;
            case 'beda': mainResults = <BedaResults data={result} />; break;
            case 'email': mainResults = <EmailResults data={result} />; break;
            default: mainResults = null;
        }

        return (
            <div className="space-y-6">
                {mainResults}
                {result.type !== 'beda' && (
                <Card>
                    <CardTitle>{firaT.title}</CardTitle>
                    {isFiraLoading ? (
                         <div className="flex items-center justify-center gap-2 text-purple-300 py-4">
                            <LoaderIcon className="w-6 h-6 animate-spin" />
                            <span>{firaT.loading}</span>
                        </div>
                    ) : firaError ? (
                        <div className="flex items-center justify-center gap-2 text-red-400 py-4">
                            <ErrorIcon className="w-6 h-6" />
                            <span>{firaError}</span>
                        </div>
                    ) : firaResult ? (
                        <FiraResults data={firaResult} />
                    ) : (
                        <div className="text-center py-4">
                            <button
                                onClick={onFiraAnalysis}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600/50 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 hover:shadow-purple-400/50 mx-auto"
                            >
                                <FiraIcon className="w-5 h-5" />
                                {firaT.runAnalysis}
                            </button>
                        </div>
                    )}
                </Card>
                )}
            </div>
        )
    };

    return (
        <div id="results-panel" className="w-full max-w-4xl mx-auto mt-8 p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl min-h-[20rem]">
            {renderContent()}
        </div>
    );
};

export default ResultsPanel;