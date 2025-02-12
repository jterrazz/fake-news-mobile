import type { NewsRepository } from '@/application/ports/news.repository';

import { NewsEntity } from '@/domain/news/news.entity';

export interface NewsService {
    getArticles: () => Promise<NewsEntity[]>;
    getFallbackArticles: () => NewsEntity[];
}

export const createNewsService = (repository: NewsRepository): NewsService => {
    const getFallbackArticles = (): NewsEntity[] => {
        const now = new Date().toISOString();
        const SAMPLE_NEWS_ITEMS: NewsEntity[] = [
            {
                article:
                    "Researchers have found that trees communicate and share resources through an underground fungal network, dubbed the 'Wood Wide Web'. This network allows trees to share nutrients and send warning signals about environmental changes and threats.",
                category: 'SCIENCE',
                createdAt: now,
                headline: 'Scientists Discover Trees Can Communicate Through Underground Network',
                id: '1',
                isFake: false,
            },
            {
                article:
                    'A startup claims to have developed a revolutionary pill that temporarily enables humans to extract oxygen from water, allowing them to breathe underwater for up to 4 hours. The pill supposedly modifies human lung tissue to process water like fish gills.',
                category: 'TECH',
                createdAt: now,
                headline: 'New Technology Allows Humans to Breathe Underwater Without Equipment',
                id: '2',
                isFake: true,
            },
            {
                article:
                    'Scientists at Stanford University have developed an AI system that successfully predicted a magnitude 5.2 earthquake in California two hours before it occurred. The system analyzes subtle changes in seismic activity and ground deformation patterns using machine learning algorithms trained on historical earthquake data.',
                category: 'TECH',
                createdAt: now,
                headline: 'AI System Predicts Earthquake 2 Hours Before It Happens',
                id: '3',
                isFake: true,
            },
            {
                article:
                    "Researchers have created the first living robots that can reproduce on their own. These microscopic 'xenobots,' made from frog cells, can find single cells, gather hundreds of them, and assemble baby robots inside their mouths that look and move like themselves.",
                category: 'SCIENCE',
                createdAt: now,
                headline: 'Scientists Create First Self-Replicating Living Robots',
                id: '4',
                isFake: false,
            },
            {
                article:
                    'A paralyzed individual has successfully posted messages on Twitter using only their thoughts, thanks to a brain-computer interface developed by researchers. The implant translates neural signals into text, allowing direct mental communication with digital devices.',
                category: 'SCIENCE',
                createdAt: now,
                headline: 'Brain Implant Allows Paralyzed Person to Tweet Using Thoughts',
                id: '5',
                isFake: false,
            },
            {
                article:
                    'A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.',
                category: 'SCIENCE',
                createdAt: now,
                headline: 'New AI-Powered Drug Can Cure Cancer in 24 Hours',
                id: '6',
                isFake: true,
            },
            {
                article:
                    'A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.',
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'New AI-Powered Drug Can Cure Cancer in 24 Hours',
                id: '7',
                isFake: true,
            },
            {
                article:
                    'A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.',
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'New AI-Powered Drug Can Cure Cancer in 24 Hours',
                id: '8',
                isFake: true,
            },
            {
                article:
                    "NASA's James Webb Space Telescope has discovered clear evidence of carbon dioxide in the atmosphere of an exoplanet 700 light-years away. This breakthrough marks the first detailed observation of an atmosphere around a rocky planet outside our solar system.",
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                headline: "Webb Telescope Detects CO2 in Distant Planet's Atmosphere",
                id: '9',
                isFake: false,
            },
            {
                article:
                    "A startup in Japan claims to have developed 'smart contact lenses' that can record and store up to 24 hours of video footage, controlled by blinking patterns. The company suggests this technology will revolutionize personal documentation and security.",
                category: 'TECH',
                createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'New Contact Lenses Can Record Video With Just a Blink',
                id: '10',
                isFake: true,
            },
            {
                article:
                    'Scientists at CERN have successfully teleported a quantum particle over a distance of 20 kilometers, marking a major breakthrough in quantum entanglement. This achievement brings us one step closer to quantum internet technology.',
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'CERN Achieves Record-Breaking Quantum Teleportation',
                id: '11',
                isFake: false,
            },
            {
                article:
                    'A new AI system developed by DeepMind has learned to read human thoughts with 95% accuracy using non-invasive brain scans. The technology can translate brain activity into text, raising both excitement and privacy concerns.',
                category: 'TECH',
                createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'AI System Can Now Read Human Thoughts Through Brain Scans',
                id: '12',
                isFake: true,
            },
            {
                article:
                    'Researchers have developed a new type of battery that can charge smartphones in under 30 seconds and last for a week. The technology uses quantum tunneling effects in a graphene-based structure.',
                category: 'TECH',
                createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                headline: '30-Second Phone Charging Battery Breakthrough',
                id: '13',
                isFake: true,
            },
            {
                article:
                    'Scientists have successfully created the first human-pig hybrid embryos, marking a significant step toward growing human organs for transplantation. The research could help address the global organ shortage crisis.',
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'Scientists Create First Human-Pig Hybrid Embryos',
                id: '14',
                isFake: false,
            },
            {
                article:
                    'A team of marine biologists has discovered a previously unknown species of giant squid that uses bioluminescence to communicate. The creature, found in the Pacific Ocean, can grow up to 40 feet in length.',
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'New Species of Glowing Giant Squid Discovered',
                id: '15',
                isFake: false,
            },
            {
                article:
                    'Engineers have invented a device that can extract drinking water from air using only solar power, producing up to 10 liters per day even in desert conditions. The breakthrough could help solve water scarcity issues worldwide.',
                category: 'TECH',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'Solar-Powered Device Creates Water from Air',
                id: '16',
                isFake: false,
            },
            {
                article:
                    "A new type of 'smart paint' has been developed that can change color on command using a smartphone app. The paint contains millions of microscopic electronic capsules that respond to electrical signals.",
                category: 'TECH',
                createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'Color-Changing Smart Paint Controlled by Phone App',
                id: '17',
                isFake: true,
            },
            {
                article:
                    'Researchers have successfully reversed aging in mice using a new gene therapy technique, extending their lifespan by 35%. The treatment shows promise for human applications in the future.',
                category: 'SCIENCE',
                createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
                headline: 'Scientists Successfully Reverse Aging in Mice',
                id: '18',
                isFake: false,
            },
        ];

        return SAMPLE_NEWS_ITEMS.map((item) => ({
            ...item,
        }));
    };

    const getArticles = async (): Promise<NewsEntity[]> => {
        try {
            return await repository.getArticles();
        } catch (error) {
            // If there's an error fetching from the API, fallback to sample data
            if (error.code === 'NO_CONTENT' || error.code === 'NETWORK_ERROR') {
                return getFallbackArticles();
            }
            throw error;
        }
    };

    return {
        getArticles,
        getFallbackArticles,
    };
};
