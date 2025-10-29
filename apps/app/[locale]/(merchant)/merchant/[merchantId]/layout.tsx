import MerchantNavBar from '@/components/merchants/MerchantNavBar';
import { ProtectedClientPage } from '@/components/auth/ProtectedClientPage';
import '../../../../globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider';

const VerifyMerchantLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <>
        <MerchantNavBar />
        <div className="pt-16 pb-20 md:pb-8">
            {children}
        </div></>

}

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="merchant-theme w-full">
            <ProtectedClientPage>
                <QueryProvider>
                    <VerifyMerchantLayout>
                        {children}
                    </VerifyMerchantLayout>
                </QueryProvider>
            </ProtectedClientPage>
        </div>
    );
}