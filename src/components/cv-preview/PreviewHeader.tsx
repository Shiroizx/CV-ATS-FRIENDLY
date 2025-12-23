interface PreviewHeaderProps {
    profilePhoto?: string;
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
    showLinkedinUnderline: boolean;
    portfolio: string;
    showPortfolioUnderline: boolean;
    address: string;
}

// Helper to check if a string is a URL
const isUrl = (str: string) => str.startsWith('http://') || str.startsWith('https://');

export default function PreviewHeader({
    profilePhoto,
    fullName,
    phone,
    email,
    linkedin,
    showLinkedinUnderline,
    portfolio,
    showPortfolioUnderline,
    address,
}: PreviewHeaderProps) {
    // Build contact items as objects with value, isLink flag, and showUnderline flag
    const contactItems: { value: string; isLink: boolean; showUnderline: boolean }[] = [];
    if (phone) contactItems.push({ value: phone, isLink: false, showUnderline: false });
    if (email) contactItems.push({ value: email, isLink: false, showUnderline: false });
    if (linkedin) contactItems.push({ value: linkedin, isLink: isUrl(linkedin), showUnderline: showLinkedinUnderline });
    if (portfolio) contactItems.push({ value: portfolio, isLink: isUrl(portfolio), showUnderline: showPortfolioUnderline });

    // If there's a photo, include address in the contact line
    if (profilePhoto && address) {
        contactItems.push({ value: address, isLink: false, showUnderline: false });
    }

    const renderContactItem = (item: { value: string; isLink: boolean; showUnderline: boolean }, index: number) => {
        if (item.isLink && item.showUnderline) {
            return (
                <a
                    key={index}
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 print:text-blue-600"
                >
                    {item.value}
                </a>
            );
        }
        return <span key={index}>{item.value}</span>;
    };

    return (
        <header className="border-b border-black pb-4 mb-5">
            <div className={`flex ${profilePhoto ? 'gap-4' : 'justify-center'}`}>
                {/* Photo on the left */}
                {profilePhoto && (
                    <div className="flex-shrink-0">
                        <img
                            src={profilePhoto}
                            alt={fullName || 'Profile'}
                            className="w-16 h-20 object-cover border border-gray-300"
                        />
                    </div>
                )}

                {/* Content - left aligned if photo, center if no photo */}
                <div className={profilePhoto ? 'text-left' : 'text-center'}>
                    <h1 className="text-2xl md:text-[26px] font-bold text-black uppercase tracking-wide mb-2">
                        {fullName || 'NAMA LENGKAP'}
                    </h1>

                    {contactItems.length > 0 && (
                        <p className="text-sm text-black mb-1">
                            {contactItems.map((item, index) => (
                                <span key={index}>
                                    {index > 0 && '  |  '}
                                    {renderContactItem(item, index)}
                                </span>
                            ))}
                        </p>
                    )}

                    {/* Only show address separately if no photo */}
                    {!profilePhoto && address && (
                        <p className="text-sm text-black">{address}</p>
                    )}
                </div>
            </div>
        </header>
    );
}
