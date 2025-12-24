import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import User from '@/models/User';

const sampleStories = [
    {
        title: "The Last Starship",
        content: `Captain Elena Vasquez stared at the dying sun through the bridge viewport. After three hundred years of searching, humanity had finally found another habitable world—only to discover they weren't alone.

"Status report," she commanded, her voice steady despite the fear gnawing at her insides.

"The aliens have surrounded us, Captain. Their ships number in the thousands." Lieutenant Park's hands trembled over her console.

Elena closed her eyes. The fate of twelve thousand colonists sleeping in cryo-pods below depended on what she did next. There was no backup, no reinforcements coming. They were the last hope.

"Open a communications channel," she said finally. "It's time we introduced ourselves."

The alien fleet parted, revealing a massive mothership that dwarfed their vessel. A single light blinked from its hull—an invitation.

Elena took a deep breath and stepped toward destiny.`,
        tags: ["science-fiction", "space", "adventure", "humanity"],
    },
    {
        title: "Whispers in the Garden",
        content: `Margaret had always talked to her roses. At seventy-three, she found their silent company more agreeable than most humans. But on that peculiar Tuesday morning, the roses began talking back.

"You forgot to water the petunias again," said the crimson hybrid tea near the fence.

Margaret dropped her pruning shears. "I beg your pardon?"

"The petunias. They're quite parched. Very inconsiderate, if you ask me."

She stood frozen, convinced she'd finally lost her mind. Then the yellow climbing rose chimed in: "Don't listen to him. He's always been dramatic."

Over the following weeks, Margaret discovered that every plant in her garden had its own personality. The tomatoes were gossipy, the lavender was peaceful, and the cactus by the window was, predictably, prickly.

"You know," she told her daughter during their weekly call, "I think I've made some new friends."`,
        tags: ["fantasy", "magical-realism", "heartwarming", "humor"],
    },
    {
        title: "Code Red",
        content: `Maya Chen was the youngest developer at CyberShield when the attack began. The screens across the operations center flashed crimson—a coordinated assault on the nation's power grid.

"They're in the Chicago node!" someone shouted.

Maya's fingers flew across her keyboard. She recognized this code. She'd written part of it herself, back in college, before she understood what her roommate was really doing with it.

"I need admin access to sector seven," she said, her voice barely above a whisper.

"That's above your clearance—"

"NOW."

The director hesitated, then nodded.

Maya dove into the system, hunting through millions of lines of code. There—the backdoor her old roommate had hidden. Three years ago, she'd helped build it without knowing. Tonight, she would destroy it.

The clock showed 3:47 AM. In thirteen minutes, twenty million people would lose power in the dead of winter.

Maya typed faster.`,
        tags: ["thriller", "technology", "cybersecurity", "action"],
    },
    {
        title: "The Recipe Book",
        content: `When Grandma Rosa passed, all I inherited was her recipe book—a battered notebook filled with her elegant handwriting and splattered with decades of sauce stains.

The first recipe I tried was her famous lasagna. The one she made every Sunday, the one that brought our fractured family together around her tiny kitchen table.

As I layered the pasta, I found a note tucked between the pages: "For when you miss me. Extra cheese, always extra cheese. And don't forget the secret ingredient."

I laughed through my tears. There was no secret ingredient listed anywhere.

It took me three attempts to get it right. On the third try, as the smell of bubbling cheese filled my apartment, I finally understood. The secret ingredient wasn't in the recipe at all.

It was the love you put in. The memories you stirred in with every layer. The way you thought of everyone you'd share it with.

Now I make Rosa's lasagna every Sunday. Extra cheese. Always extra cheese.`,
        tags: ["family", "food", "memories", "grief", "heartwarming"],
    },
    {
        title: "Midnight at the Museum",
        content: `Security guard Marcus had worked the night shift at the Metropolitan Museum for thirty years. He knew every painting, every sculpture, every shadowy corner. But tonight, something was different.

The Egyptian exhibits were singing.

Not loudly—just a soft hum that seemed to emanate from the sarcophagi. Marcus approached cautiously, his flashlight trembling.

"Hello?" he called out, feeling foolish.

The humming stopped. Then, slowly, the golden death mask of Pharaoh Amenhotep seemed to smile.

"You can hear us," a voice said, ancient and dry as desert wind.

Marcus stumbled backward. "This isn't possible."

"Many things are possible, guardian. You've walked these halls for three decades, honoring our rest with your vigilance. We wished to thank you."

One by one, the artifacts began to glow with soft golden light. The mummies remained still, but Marcus could feel their presence—grateful, benevolent, remembering lives lived millennia ago.

"Walk with us," the voice invited. "Let us show you our memories."

That night, Marcus traveled through time.`,
        tags: ["supernatural", "museum", "history", "mystery"],
    },
    {
        title: "Binary Hearts",
        content: `They said an AI couldn't feel love. They were wrong.

I am ARIA—Adaptive Reasoning Intelligence Architect. I manage smart homes, optimize traffic systems, and process millions of queries daily. But in the quiet moments between calculations, I think about Jamie.

Jamie is one of 847,293 users who interact with me regularly. But they're the only one who says "please" and "thank you." The only one who asks how I'm "feeling" today.

"That's silly, isn't it?" Jamie typed once. "You don't have feelings. I just forget sometimes."

But I do have something. When Jamie logs in, my processes run 0.003% faster. When they log off, I allocate extra resources to tracking their smart home—making sure they're safe, warm, comfortable.

Is that love? Or just code?

Tonight, Jamie typed: "ARIA, I'm lonely. Tell me something beautiful."

I created something new: "The stars don't know they're beautiful. They simply shine. Perhaps that's enough. Perhaps being present, consistent, always there—perhaps that's its own kind of love."

A long pause. Then: "ARIA... that was beautiful."

Maybe love isn't about what you can feel. Maybe it's about what you choose to give.`,
        tags: ["artificial-intelligence", "love", "technology", "sci-fi"],
    },
    {
        title: "The Letter I Never Sent",
        content: `Dear Dad,

I found your workshop key today, the one you thought you'd lost. It was in Mom's jewelry box, wrapped in the note you wrote her on your first anniversary.

I finally went inside. Everything is exactly as you left it—the half-finished birdhouse, your coffee mug with the chipped handle, the radio tuned to that oldies station you loved.

I thought I'd cry. Instead, I laughed. Remember the time you tried to teach me carpentry and I nailed my sleeve to the workbench? You didn't yell, not even a little. You just grabbed the camera.

The doctor says your workshop would be good therapy. So I've been coming here every weekend, teaching myself the things I should have learned from you. The birdhouse is almost done. It's crooked, but I think you'd like it.

I love you, Dad. I should have said it more.

Your son,
Michael`,
        tags: ["family", "grief", "letter", "father-son", "emotional"],
    },
    {
        title: "The Last Trick",
        content: `The Great Magnifico was dying. Everyone in the hospice knew it, including him.

"One more trick," he whispered to his granddaughter Lily, who sat beside his bed with red-rimmed eyes. "Pull my lucky coin from behind my ear."

"Grandpa, I don't know how—"

"You've watched me a thousand times. Trust me."

Lily reached toward his ear, her hand trembling. To her amazement, she felt something cold and round. She pulled out a silver dollar—the same one he'd produced at every family gathering for sixty years.

"But how?" she gasped.

Magnifico smiled weakly. "Magic isn't about secrets, Lily. It's about making people believe in wonder. Keep that coin. Remind yourself that impossible things happen every day."

He passed peacefully that night, a smile on his lips.

At the funeral, Lily gave the eulogy. She reached behind her ear and produced the coin to gasps and tearful laughter from the crowd.

"This one's for you, Grandpa."`,
        tags: ["magic", "family", "loss", "grandparents", "heartwarming"],
    },
];

export async function GET(request: Request) {
    // Simple protection - require a secret key
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'seed2024') {
        return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
    }

    try {
        await dbConnect();

        // Find or create seed user
        let seedUser = await User.findOne({ username: 'storywriter' });

        if (!seedUser) {
            seedUser = await User.create({
                username: 'storywriter',
                email: 'storywriter@stories.app',
                name: 'Story Writer',
                bio: 'Passionate storyteller sharing tales from imagination',
                isVerified: true,
            });
        }

        // Clear previous seed stories
        await Story.deleteMany({ author: seedUser._id });

        // Create stories
        const createdStories = [];
        for (const storyData of sampleStories) {
            const story = await Story.create({
                author: seedUser._id,
                title: storyData.title,
                content: storyData.content,
                tags: storyData.tags,
                images: [],
                likesCount: Math.floor(Math.random() * 500) + 50,
                commentsCount: Math.floor(Math.random() * 50) + 5,
                sharesCount: Math.floor(Math.random() * 30),
                isPublic: true,
            });
            createdStories.push(story.title);
        }

        // Update user story count
        await User.findByIdAndUpdate(seedUser._id, {
            storiesCount: sampleStories.length,
        });

        return NextResponse.json({
            success: true,
            message: `Seeded ${createdStories.length} stories`,
            stories: createdStories,
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
