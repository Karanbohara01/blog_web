import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import CreateStoryForm from '@/components/story/CreateStoryForm';

export const metadata = {
    title: 'Create Story - Stories',
    description: 'Share your story with the world',
};

export default async function CreatePage() {
    const session = await auth();

    if (!session) {
        redirect('/login?callbackUrl=/create');
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
            <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '32px',
            }}>
                Create Story
            </h1>
            <CreateStoryForm />
        </div>
    );
}
