import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Module from '../models/Module.js';
import connectDB from '../config/db.js';

dotenv.config();

const modules = [
  {
    moduleNumber: 1,
    title: 'Welcome to Your Body',
    description: 'Understanding your unique body and celebrating what makes you special',
    icon: '🌟',
    category: 'body',
    estimatedMinutes: 10,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Your Amazing Body',
          content: 'Your body is amazing and unique! Just like fingerprints, no two bodies are exactly alike. During your teen years, your body will go through many changes, and that\'s completely normal and natural.',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Body Positivity',
          content: 'Body positivity means accepting and loving your body just the way it is. Everyone develops at their own pace - some people might experience changes earlier or later than their friends, and that\'s perfectly okay!',
          order: 2,
        },
        {
          type: 'tip',
          heading: 'Remember',
          content: 'There is no "normal" when it comes to bodies. What\'s normal is that everyone is different!',
          order: 3,
        },
        {
          type: 'text',
          heading: 'What Changes Are Normal?',
          content: 'During puberty, you might notice: growth spurts, body hair, skin changes, voice changes, and emotional shifts. All of these are signs that your body is growing and developing healthily.',
          order: 4,
        },
      ],
    },
    keyTakeaways: [
      'Your body is unique and amazing',
      'Everyone develops at their own pace',
      'Changes during puberty are normal and natural',
      'Body positivity means accepting yourself',
    ],
  },
  {
    moduleNumber: 2,
    title: 'Understanding Puberty',
    description: 'What is puberty and when does it happen?',
    icon: '🦋',
    category: 'puberty',
    estimatedMinutes: 12,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'What is Puberty?',
          content: 'Puberty is the time when your body transforms from a child\'s body into an adult body. It\'s driven by hormones - special chemicals in your body that tell it when to grow and change.',
          order: 1,
        },
        {
          type: 'text',
          heading: 'When Does It Happen?',
          content: 'Puberty typically starts between ages 8-13 for girls and 9-14 for boys, but everyone\'s timeline is different. Some people start earlier, some later - both are completely normal!',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Physical Changes',
          content: 'Physical changes include: getting taller, developing body hair, skin changes (like acne), body odor, voice changes, and development of reproductive organs.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Emotional Changes',
          content: 'Hormones also affect your emotions! You might feel mood swings, feel more self-conscious, or experience new feelings. These emotional changes are just as normal as physical ones.',
          order: 4,
        },
        {
          type: 'tip',
          heading: 'It\'s Okay to Feel',
          content: 'Feeling confused, excited, nervous, or all of these at once is totally normal during puberty!',
          order: 5,
        },
      ],
    },
    keyTakeaways: [
      'Puberty is the transition from child to adult',
      'Everyone\'s timeline is different',
      'Both physical and emotional changes are normal',
      'Hormones drive these changes',
    ],
  },
  {
    moduleNumber: 3,
    title: 'All About Periods',
    description: 'Understanding menstruation and the menstrual cycle',
    icon: '🌸',
    category: 'periods',
    estimatedMinutes: 15,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'What is Menstruation?',
          content: 'Menstruation, also called a period, is when blood and tissue from the uterus leaves the body through the vagina. It\'s a natural part of the reproductive system and happens once a month for most people who menstruate.',
          order: 1,
        },
        {
          type: 'text',
          heading: 'The Menstrual Cycle',
          content: 'The menstrual cycle is typically 28 days long, but can range from 21-35 days. During this cycle, the body prepares for a possible pregnancy. If pregnancy doesn\'t occur, the uterus lining sheds, resulting in a period.',
          order: 2,
        },
        {
          type: 'text',
          heading: 'When to Expect Your First Period',
          content: 'Most people get their first period between ages 10-15. Signs it might be coming soon include: breast development, pubic hair growth, vaginal discharge, and growth spurts.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Common Myths Debunked',
          content: 'MYTH: You can\'t swim during your period. TRUTH: You absolutely can! MYTH: Periods are "dirty." TRUTH: Periods are natural and healthy. MYTH: Everyone has the same experience. TRUTH: Period experiences vary greatly from person to person.',
          order: 4,
        },
        {
          type: 'tip',
          heading: 'First Period Tip',
          content: 'It\'s helpful to keep a pad or period product in your bag once you think your first period might be approaching.',
          order: 5,
        },
      ],
    },
    keyTakeaways: [
      'Periods are a natural, healthy part of life',
      'The menstrual cycle prepares the body for pregnancy',
      'First periods usually happen between ages 10-15',
      'Many period myths are not true',
    ],
  },
  {
    moduleNumber: 4,
    title: 'Period Products 101',
    description: 'Learn about pads, tampons, cups, and how to use them safely',
    icon: '🩹',
    category: 'periods',
    estimatedMinutes: 12,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Types of Period Products',
          content: 'There are several options: pads (stick to underwear), tampons (insert into vagina), menstrual cups (reusable cup), period underwear (absorbent underwear). Each has pros and cons!',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Pads',
          content: 'Pads are a great option for beginners. They come in different sizes and absorbencies. Change them every 3-4 hours or more often if needed. Wrap used pads and throw them in the trash, not the toilet!',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Tampons',
          content: 'Tampons are inserted into the vagina. Start with the smallest size and read instructions carefully. Change every 4-8 hours to prevent Toxic Shock Syndrome (TSS). Never leave one in overnight for more than 8 hours.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Menstrual Cups',
          content: 'Cups are reusable, eco-friendly, and can be worn up to 12 hours. They might have a learning curve but many people love them! Always clean them properly between uses.',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Choosing What\'s Right for You',
          content: 'The best period product is the one that works for YOU! It might take some trial and error to find your favorite. You can also use different products at different times.',
          order: 5,
        },
        {
          type: 'tip',
          heading: 'Safety First',
          content: 'Always wash your hands before and after changing period products to prevent infections.',
          order: 6,
        },
      ],
    },
    keyTakeaways: [
      'Many period product options are available',
      'Pads are great for beginners',
      'Change products regularly for hygiene',
      'Choose what works best for your body and lifestyle',
    ],
  },
  {
    moduleNumber: 5,
    title: 'Managing Period Symptoms',
    description: 'Tips for dealing with cramps, mood changes, and other period symptoms',
    icon: '💆',
    category: 'periods',
    estimatedMinutes: 10,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Common Period Symptoms',
          content: 'Many people experience: cramps (pain in lower belly), bloating, headaches, fatigue, mood changes, breast tenderness, and back pain. These are caused by hormonal changes.',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Cramp Relief',
          content: 'Ways to ease cramps: heat (heating pad or warm bath), gentle exercise, over-the-counter pain relievers (ask a parent/guardian), drinking water, and rest. Find what works best for you!',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Mood Changes',
          content: 'Hormones can affect emotions. You might feel more emotional, irritable, or sad before or during your period. This is called PMS (premenstrual syndrome) and is very common.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'When to See a Doctor',
          content: 'Talk to a doctor if: pain is severe and doesn\'t improve with home remedies, periods are extremely heavy, you miss school regularly due to symptoms, or you\'re worried about any changes.',
          order: 4,
        },
        {
          type: 'tip',
          heading: 'Self-Care Tips',
          content: 'Track your cycle to know when symptoms might appear. Eat healthy foods, stay hydrated, get enough sleep, and be kind to yourself!',
          order: 5,
        },
      ],
    },
    keyTakeaways: [
      'Period symptoms are common and normal',
      'Heat, rest, and pain relievers can help cramps',
      'Mood changes are caused by hormones',
      'Severe symptoms should be discussed with a doctor',
    ],
  },
  {
    moduleNumber: 6,
    title: 'Hygiene and Self-Care',
    description: 'Daily routines for keeping your body clean and healthy',
    icon: '🧼',
    category: 'hygiene',
    estimatedMinutes: 10,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Why Hygiene Matters',
          content: 'Good hygiene keeps you healthy, prevents infections, helps you feel confident, and is a way to take care of yourself. During puberty, your body produces more sweat and oil, so hygiene becomes even more important!',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Showering and Bathing',
          content: 'Shower or bathe daily, especially after sports or sweating. Use mild soap and wash all areas. Don\'t forget behind your ears, between toes, and underarms! Wash your hair regularly based on your hair type.',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Dealing with Body Odor',
          content: 'Body odor happens when bacteria mix with sweat. Prevent it by: showering regularly, using deodorant or antiperspirant, wearing clean clothes, and choosing breathable fabrics like cotton.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Dental Care',
          content: 'Brush your teeth twice a day for 2 minutes each time. Floss daily and visit the dentist regularly. Good oral hygiene prevents cavities and keeps your smile healthy!',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Skin Care Basics',
          content: 'Wash your face twice daily with gentle cleanser. Drink water, eat fruits and vegetables, and protect your skin from the sun. If you get acne, know that it\'s super common during puberty!',
          order: 5,
        },
      ],
    },
    keyTakeaways: [
      'Daily hygiene is important during puberty',
      'Shower regularly and use deodorant',
      'Brush teeth twice daily',
      'Take care of your skin with gentle products',
    ],
  },
  {
    moduleNumber: 7,
    title: 'Emotional Changes and Mental Health',
    description: 'Understanding mood swings, stress, and building confidence',
    icon: '❤️',
    category: 'emotions',
    estimatedMinutes: 12,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Emotions During Puberty',
          content: 'Hormones affect your brain and emotions. You might feel happy one moment and sad the next, feel more sensitive, or have stronger reactions. This is totally normal!',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Understanding Mood Swings',
          content: 'Mood swings are sudden changes in how you feel. They\'re caused by hormonal changes and are common during puberty. Remember: your feelings are valid, but they don\'t define you.',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Managing Stress and Anxiety',
          content: 'Helpful strategies: deep breathing, talking to someone you trust, exercise, creative activities, getting enough sleep, and taking breaks when overwhelmed. Find healthy ways to cope!',
          order: 3,
        },
        {
          type: 'text',
          heading: 'When to Ask for Help',
          content: 'Talk to a trusted adult if: you feel sad or worried most of the time, emotions interfere with daily life, you have thoughts of hurting yourself, or you just need support. Asking for help is a sign of strength!',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Building Self-Confidence',
          content: 'Focus on your strengths, practice positive self-talk, set small achievable goals, surround yourself with supportive people, and remember that everyone has insecurities.',
          order: 5,
        },
        {
          type: 'tip',
          heading: 'Self-Care Matters',
          content: 'Taking care of your mental health is just as important as taking care of your physical health!',
          order: 6,
        },
      ],
    },
    keyTakeaways: [
      'Hormones affect emotions during puberty',
      'Mood swings are normal',
      'Healthy coping strategies help manage stress',
      'It\'s okay to ask for help',
    ],
  },
  {
    moduleNumber: 8,
    title: 'Your Changing Body - For Everyone',
    description: 'Growth spurts, body hair, voice changes, and more',
    icon: '🌱',
    category: 'body',
    estimatedMinutes: 10,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Growth Spurts',
          content: 'During puberty, you\'ll grow taller faster than ever before! Girls often have their growth spurt earlier (ages 10-14), while boys typically grow most between 12-16. You might feel clumsy as your body adjusts to its new size!',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Body Hair',
          content: 'Hair will grow in new places: underarms, pubic area, legs, and sometimes face and chest. This is completely natural. Whether or not to remove body hair is a personal choice!',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Voice Changes',
          content: 'Voices deepen during puberty, especially for boys. The voice box (larynx) grows larger. You might experience voice cracks - this is temporary and normal! Girls\' voices may also deepen slightly.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Breast Development',
          content: 'Breast development usually starts between ages 8-13. Breasts grow at different rates and one might be larger than the other (this is normal!). Sports bras can provide comfort during development.',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Everyone Is Different',
          content: 'Some people develop quickly, others slowly. Some are tall, others short. Some have lots of body hair, others less. All of these variations are normal and healthy!',
          order: 5,
        },
      ],
    },
    keyTakeaways: [
      'Growth spurts are a major part of puberty',
      'Body hair growth is natural',
      'Voice changes are temporary',
      'Everyone develops at their own pace',
    ],
  },
  {
    moduleNumber: 9,
    title: 'Healthy Relationships',
    description: 'Friendships, communication, boundaries, and respect',
    icon: '🤝',
    category: 'relationships',
    estimatedMinutes: 12,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Friendships During Puberty',
          content: 'Friendships might change as you grow. You might feel closer to some friends and drift from others. It\'s okay to have different friend groups or to outgrow friendships. Quality matters more than quantity!',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Communication Skills',
          content: 'Good communication includes: listening actively, expressing your feelings clearly, being honest, respecting different opinions, and asking questions when you don\'t understand.',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Setting Boundaries',
          content: 'Boundaries are limits you set for yourself. It\'s okay to say "no" to things that make you uncomfortable. True friends will respect your boundaries. You also need to respect others\' boundaries!',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Dealing with Peer Pressure',
          content: 'Peer pressure is when friends try to get you to do something you don\'t want to do. Remember: real friends respect your choices. It\'s okay to be different and make your own decisions.',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Healthy vs. Unhealthy Relationships',
          content: 'Healthy relationships include: respect, trust, honesty, support, and equality. Unhealthy signs include: being controlled, feeling scared, being pressured, or being put down.',
          order: 5,
        },
      ],
    },
    keyTakeaways: [
      'Friendships naturally evolve during puberty',
      'Good communication builds strong relationships',
      'Setting boundaries is healthy and necessary',
      'Real friends respect your choices',
    ],
  },
  {
    moduleNumber: 10,
    title: 'Body Safety and Consent',
    description: 'Understanding consent, boundaries, and staying safe',
    icon: '🛡️',
    category: 'safety',
    estimatedMinutes: 15,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'What is Consent?',
          content: 'Consent means giving permission for something to happen. For any physical contact, everyone involved must agree freely and enthusiastically. You have the right to say no at any time, and others must respect that.',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Your Body Belongs to You',
          content: 'No one has the right to touch your body in ways that make you uncomfortable. You are in charge of your own body. Trust your instincts - if something feels wrong, it probably is.',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Good Touch vs. Bad Touch',
          content: 'Good touches feel safe and comfortable (like hugs from family). Bad touches make you feel uncomfortable, scared, or confused. Private parts (covered by a swimsuit) are private. No one should touch them except for medical reasons with a parent present.',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Speaking Up and Saying No',
          content: 'It\'s always okay to say NO to anything that makes you uncomfortable, even to adults or friends. You can use a firm voice, walk away, or tell a trusted adult. You will never get in trouble for speaking up about feeling unsafe.',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Trusted Adults',
          content: 'Identify trusted adults you can talk to: parents, teachers, school counselors, coaches, or relatives. If someone asks you to keep a "secret" that makes you uncomfortable, tell a trusted adult immediately.',
          order: 5,
        },
        {
          type: 'text',
          heading: 'Online Safety',
          content: 'Be careful online: don\'t share personal information, photos, or location with strangers. If someone makes you uncomfortable online, block them and tell a trusted adult. Remember: people online aren\'t always who they claim to be.',
          order: 6,
        },
        {
          type: 'tip',
          heading: 'Remember',
          content: 'Nothing is ever your fault if someone makes you feel unsafe or uncomfortable. Always tell a trusted adult!',
          order: 7,
        },
      ],
    },
    keyTakeaways: [
      'Consent means everyone agrees freely',
      'Your body belongs to you',
      'It\'s always okay to say no',
      'Tell a trusted adult if you feel unsafe',
    ],
  },
  {
    moduleNumber: 11,
    title: 'Nutrition and Exercise',
    description: 'Eating well, staying active, and developing healthy habits',
    icon: '🥗',
    category: 'body',
    estimatedMinutes: 10,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Eating Well During Puberty',
          content: 'Your body needs extra nutrition during puberty to support growth. Eat a variety of foods: fruits, vegetables, whole grains, proteins, and dairy. Don\'t skip meals, especially breakfast!',
          order: 1,
        },
        {
          type: 'text',
          heading: 'Body Image and Health',
          content: 'Your body will change shape during puberty - this is normal! Focus on being healthy, not on looking a certain way. Everyone\'s body is different, and that\'s beautiful. Avoid comparing yourself to others or images on social media.',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Benefits of Exercise',
          content: 'Exercise helps: build strong bones and muscles, improve mood, reduce stress, boost energy, sleep better, and feel more confident. Find activities you enjoy - it doesn\'t have to be competitive sports!',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Staying Active',
          content: 'Aim for at least 60 minutes of physical activity daily. This can include: walking, dancing, swimming, biking, sports, or playing outside. Make it fun, not a chore!',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Sleep is Important',
          content: 'Teens need 8-10 hours of sleep each night. Sleep helps your body grow, your brain learn, and your emotions stay balanced. Create a bedtime routine and limit screens before bed.',
          order: 5,
        },
        {
          type: 'tip',
          heading: 'Healthy Habits',
          content: 'Small changes add up! Drink more water, choose healthy snacks, and move your body every day.',
          order: 6,
        },
      ],
    },
    keyTakeaways: [
      'Eat a variety of nutritious foods',
      'Focus on health, not appearance',
      'Exercise has many benefits',
      'Sleep is crucial for growth and well-being',
    ],
  },
  {
    moduleNumber: 12,
    title: 'Your Questions Answered',
    description: 'Common questions, concerns, and resources for more information',
    icon: '❓',
    category: 'general',
    estimatedMinutes: 10,
    pointsValue: 50,
    content: {
      sections: [
        {
          type: 'text',
          heading: 'Common Questions',
          content: 'Q: Is it normal to develop faster/slower than friends? A: Yes! Everyone has their own timeline. Q: Why do I feel emotional all the time? A: Hormones affect emotions. Q: Who can I talk to about puberty? A: Parents, teachers, school nurses, counselors, or doctors.',
          order: 1,
        },
        {
          type: 'text',
          heading: 'When to See a Doctor',
          content: 'See a doctor if: you haven\'t started puberty by age 14, periods are extremely painful or heavy, you notice unusual discharge or pain, you have concerns about your development, or you just have questions!',
          order: 2,
        },
        {
          type: 'text',
          heading: 'Talking to Adults',
          content: 'It might feel awkward to talk about puberty, but trusted adults want to help! They\'ve been through it too. Write down questions, choose a private time, and remember that no question is "dumb."',
          order: 3,
        },
        {
          type: 'text',
          heading: 'Resources for More Info',
          content: 'Reliable resources include: your doctor, school nurse, health class, trusted websites (like KidsHealth.org), and books from the library. Always check with an adult before using online resources.',
          order: 4,
        },
        {
          type: 'text',
          heading: 'Celebrating Your Journey',
          content: 'Puberty is an exciting time of growth and discovery! You\'re learning about your body, discovering who you are, and developing into the person you\'ll become. Be patient with yourself and celebrate your progress!',
          order: 5,
        },
        {
          type: 'tip',
          heading: 'You\'re Not Alone',
          content: 'Everyone goes through puberty. You\'re not the only one with questions or concerns. It\'s okay to ask for help!',
          order: 6,
        },
      ],
    },
    keyTakeaways: [
      'All questions about puberty are valid',
      'Trusted adults are there to help',
      'Reliable resources are available',
      'Puberty is a normal, exciting journey',
    ],
  },
];

const seedModules = async () => {
  try {
    await connectDB();

    await Module.deleteMany({});
    console.log('Existing modules cleared');

    const createdModules = await Module.insertMany(modules);
    console.log(`${createdModules.length} modules created successfully!`);

    console.log('\nModules:');
    createdModules.forEach(m => {
      console.log(`  ${m.moduleNumber}. ${m.icon} ${m.title} (${m.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding modules:', error);
    process.exit(1);
  }
};

seedModules();
