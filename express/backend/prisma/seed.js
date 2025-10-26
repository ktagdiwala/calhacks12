const { PrismaClient, QuestionType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create two users (upsert to avoid duplicates)
  const usersData = [
    {
      email: 'alice.cs@student.edu',
      username: 'alice_cs',
      password: 'password123',
      authId: 'auth|alice_cs'
    },
    {
      email: 'bob.che@recentgrad.com',
      username: 'bob_chem',
      password: 'securepass456',
      authId: 'auth|bob_chem'
    }
  ];

  // Third user: learning Japanese, guitar/music, and working out
  usersData.push({
    email: 'charlie.learns@hobby.com',
    username: 'charlie_learner',
    password: 'guitarJPN789',
    authId: 'auth|charlie_learner'
  });

  const users = {};
  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { username: u.username, password: hashed, authId: u.authId },
      create: { email: u.email, username: u.username, password: hashed, authId: u.authId }
    });
    users[u.username] = user;
  }

  // Tags for each user (subjects)
  const csTags = [
    { name: 'Software Design', description: 'Design patterns and software architecture' },
    { name: 'Database Management Systems', description: 'RDBMS concepts, SQL, indexing' },
    { name: 'Operating Systems', description: 'Processes, scheduling, memory management' },
    { name: 'Algorithms', description: 'Complexity, sorting, graphs' }
  ];

  const chemTags = [
    { name: 'Thermodynamics', description: 'Energy, enthalpy, entropy' },
    { name: 'Transport Phenomena', description: 'Momentum, heat, mass transfer' },
    { name: 'Chemical Reaction Engineering', description: 'Kinetics and reactor design' },
    { name: 'Process Control', description: 'Control systems and PID' }
  ];

  const hobbyTags = [
    { name: 'Japanese', description: 'Language fundamentals: vocabulary, grammar, kanji' },
    { name: 'Music (Guitar)', description: 'Music theory applied to guitar: chords, scales, rhythm' },
    { name: 'Fitness', description: 'Working out principles: strength training, hypertrophy, recovery' }
  ];

  const allTagsList = [...csTags, ...chemTags, ...hobbyTags];

  const tags = {};
  for (const t of allTagsList) {
    const tag = await prisma.tag.upsert({
      where: { name: t.name },
      update: { description: t.description },
      create: { name: t.name, description: t.description }
    });
    tags[tag.name] = tag;
  }

  // Helper to create quiz questions for a tag
  async function createQuestionsForTag(tagName, questions) {
    const created = [];
    for (const q of questions) {
      const cq = await prisma.quizQuestion.create({
        data: {
          question: q.question,
          correctAnswer: q.correctAnswer,
          type: q.type,
          sourceFile: q.sourceFile || null,
          tagId: tags[tagName].id
        }
      });
      created.push(cq);
    }
    return created;
  }

  // Questions for CS tags (mix of types)
  const createdQuestions = [];

  // Software Design
  createdQuestions.push(...await createQuestionsForTag('Software Design', [
    {
      question: 'What design pattern provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation?',
      correctAnswer: 'Iterator',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which pattern would you use to ensure a class has only one instance and provide a global point of access to it?',
      correctAnswer: 'Singleton',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which pattern separates the construction of a complex object from its representation so that the same construction process can create different representations?',
      correctAnswer: 'Builder',
      type: 'MULTIPLE_CHOICE'
    }
  ]));

  // Database Management Systems
  createdQuestions.push(...await createQuestionsForTag('Database Management Systems', [
    {
      question: 'Which SQL command is used to remove all rows from a table, while keeping the table structure?',
      correctAnswer: 'TRUNCATE',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'What is the time complexity of a B-Tree search in terms of number of disk reads?',
      correctAnswer: 'O(log n)',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which isolation level can cause phantom reads?',
      correctAnswer: 'READ COMMITTED',
      type: 'MULTIPLE_CHOICE'
    }
  ]));

  // Operating Systems
  createdQuestions.push(...await createQuestionsForTag('Operating Systems', [
    {
      question: 'What scheduling algorithm selects the process with the smallest next CPU burst?',
      correctAnswer: 'Shortest Job First',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'A process that is waiting for I/O is in which state?',
      correctAnswer: 'Blocked',
      type: 'MULTIPLE_CHOICE'
    },
    {
      question: 'Calculate the effective access time if memory access = 100ns and TLB hit ratio is 90% with TLB access = 10ns (assume no page fault).',
      correctAnswer: '100 + 0.9*10? Actually compute: effective = 0.9*(10+100) + 0.1*(10+100) = 110',
      type: 'FILL_IN_BLANK'
    }
  ]));

  // Algorithms
  createdQuestions.push(...await createQuestionsForTag('Algorithms', [
    {
      question: 'What is the best-case time complexity of QuickSort?',
      correctAnswer: 'O(n log n)',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which algorithm is used to find shortest path in graphs with non-negative weights?',
      correctAnswer: 'Dijkstra',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which of these sorting algorithms is stable by default? (a) QuickSort (b) MergeSort (c) HeapSort',
      correctAnswer: 'b',
      type: 'MULTIPLE_CHOICE'
    }
  ]));

  // Chemical Engineering tags/questions
  createdQuestions.push(...await createQuestionsForTag('Thermodynamics', [
    {
      question: 'What is the zeroth law of thermodynamics about?',
      correctAnswer: 'Thermal equilibrium',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Calculate the work done by an ideal gas in an isothermal expansion from V1 to V2 at temperature T (R is gas constant).',
      correctAnswer: 'W = nRT ln(V2/V1)',
      type: 'FILL_IN_BLANK'
    }
  ]));

  createdQuestions.push(...await createQuestionsForTag('Transport Phenomena', [
    {
      question: 'What does Reynolds number characterize?',
      correctAnswer: 'Flow regime (laminar vs turbulent)',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'For flow in a pipe, which dimensionless number compares inertial to viscous forces?',
      correctAnswer: 'Reynolds number',
      type: 'MULTIPLE_CHOICE'
    }
  ]));

  createdQuestions.push(...await createQuestionsForTag('Chemical Reaction Engineering', [
    {
      question: 'For a first-order irreversible reaction A -> products, write the concentration vs time relation.',
      correctAnswer: 'C = C0 * exp(-k*t)',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'If a plug flow reactor has volume V and inlet flow rate F (L/s) and first-order rate constant k, the conversion X is given by?',
      correctAnswer: 'X = 1 - exp(-k*V/F)',
      type: 'FILL_IN_BLANK'
    }
  ]));

  createdQuestions.push(...await createQuestionsForTag('Process Control', [
    {
      question: 'What does PID stand for?',
      correctAnswer: 'Proportional Integral Derivative',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which controller action helps eliminate steady-state error?',
      correctAnswer: 'Integral',
      type: 'MULTIPLE_CHOICE'
    }
  ]));

  // Hobby / personal learning tags for third user
  createdQuestions.push(...await createQuestionsForTag('Japanese', [
    {
      question: 'What is the Japanese word for "thank you" (casual)?',
      correctAnswer: 'ありがとう (arigatou)',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which script is primarily used for native Japanese words and grammatical elements?',
      correctAnswer: 'Hiragana',
      type: 'MULTIPLE_CHOICE'
    },
    {
      question: 'Explain how particles like "は (wa)" and "が (ga)" differ in marking the subject/topic of a sentence.',
      correctAnswer: 'Particles mark topic vs subject: は marks the topic or contrast, が marks the subject or new information.',
      type: 'EXPLAIN_PROMPT'
    }
  ]));

  createdQuestions.push(...await createQuestionsForTag('Music (Guitar)', [
    {
      question: 'What is the interval distance in semitones of a perfect fifth?',
      correctAnswer: '7',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which scale is commonly used for blues solos (a) Major (b) Minor pentatonic (c) Ionian',
      correctAnswer: 'b',
      type: 'MULTIPLE_CHOICE'
    },
    {
      question: 'Explain the purpose of palm muting on guitar and when it is commonly used.',
      correctAnswer: 'Palm muting reduces sustain/volume and adds percussive attack; commonly used in rock/metal rhythm to create tight chugging.',
      type: 'EXPLAIN_PROMPT'
    }
  ]));

  createdQuestions.push(...await createQuestionsForTag('Fitness', [
    {
      question: 'For hypertrophy training, a common rep range per set is?',
      correctAnswer: '6-12',
      type: 'FILL_IN_BLANK'
    },
    {
      question: 'Which macronutrient is primarily responsible for muscle repair and growth?',
      correctAnswer: 'Protein',
      type: 'MULTIPLE_CHOICE'
    },
    {
      question: 'Explain the importance of progressive overload in a training program.',
      correctAnswer: 'Progressive overload gradually increases stress on muscles (weight, reps, volume) to drive adaptation and continued strength/muscle gains.',
      type: 'EXPLAIN_PROMPT'
    }
  ]));

  // Create sample flashcards for each tag (shared across users). Check existence to avoid duplicates.
  const sampleFlashcardsByTag = {
    'Software Design': [
      'Singleton ensures a class has only one instance',
      'SOLID principles: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion'
    ],
    'Database Management Systems': [
      'ACID: Atomicity, Consistency, Isolation, Durability',
      'Indexes reduce the number of disk reads required for queries'
    ],
    'Operating Systems': [
      'Deadlock conditions: mutual exclusion, hold and wait, no preemption, circular wait',
      'Virtual memory allows programs to use more memory than physically available via paging'
    ],
    'Algorithms': [
      'Big O notation describes worst-case asymptotic complexity',
      'Dijkstra finds shortest paths in graphs with non-negative weights'
    ],
    'Thermodynamics': [
      'Enthalpy H = U + PV',
      'Entropy is a measure of disorder; spontaneous processes increase entropy in isolated systems'
    ],
    'Transport Phenomena': [
      'Reynolds number (Re) characterizes flow regime (laminar vs turbulent)',
      "Fick's law: diffusion flux is proportional to concentration gradient"
    ],
    'Chemical Reaction Engineering': [
      'First-order kinetics: C = C0 * exp(-k*t)',
      'PFR conversion X = 1 - exp(-k*V/F) for first-order reactions'
    ],
    'Process Control': [
      'PID actions: P for proportional, I for integral (removes steady-state error), D for derivative (predicts)',
      'A setpoint is the desired target value for a control loop'
    ],
    'Japanese': [
      'Hiragana is used for native Japanese words and grammatical elements',
      'Katakana is used for foreign loanwords and emphasis'
    ],
    'Music (Guitar)': [
      'Minor pentatonic scale degrees: 1, b3, 4, 5, b7',
      'Power chords are root + fifth and are common in rock rhythm playing'
    ],
    'Fitness': [
      'Progressive overload means gradually increasing weight/reps/volume to stimulate adaptation',
      'Compound lifts (squat, deadlift, bench) work multiple muscle groups and build overall strength'
    ]
  };

  for (const [tagName, infos] of Object.entries(sampleFlashcardsByTag)) {
    const tag = tags[tagName];
    if (!tag) continue;
    for (const info of infos) {
      const exists = await prisma.flashcard.findFirst({ where: { information: info, tagId: tag.id } });
      if (!exists) {
        await prisma.flashcard.create({ data: { information: info, tagId: tag.id } });
      }
    }
  }

  // Create a small UserInput entry for each user (personal notes). Avoid duplicates by checking description.
  const userInputsByUser = {
    'alice_cs': [
      { description: 'Course notes - Software Design', content: 'Observer, Strategy; remember to review SOLID examples.' }
    ],
    'bob_chem': [
      { description: 'Interview topics', content: 'Review thermodynamics, reaction kinetics, and process control summary.' }
    ],
    'charlie_learner': [
      { description: 'Practice log', content: 'Guitar: pentatonic practice, chord changes. Japanese: 10 vocab words/day.' }
    ]
  };

  for (const [username, inputs] of Object.entries(userInputsByUser)) {
    const user = users[username];
    if (!user) continue;
    for (const ui of inputs) {
      const exists = await prisma.userInput.findFirst({ where: { userId: user.id, description: ui.description } });
      if (!exists) {
        await prisma.userInput.create({ data: { description: ui.description, content: ui.content, userId: user.id } });
      }
    }
  }

  // Create logs: tie each user to 2-3 questions per tag (simulate initial usage)
  const allQuestions = await prisma.quizQuestion.findMany();

  const logsToCreate = [];
  for (const username of Object.keys(users)) {
    const user = users[username];
    // For each tag, pick up to 2 questions
    for (const tagName of Object.keys(tags)) {
      const tag = tags[tagName];
      const tagQuestions = allQuestions.filter(q => q.tagId === tag.id).slice(0, 2);
      for (const q of tagQuestions) {
        logsToCreate.push({
          userId: user.id,
          tagId: tag.id,
          questionId: q.id,
          distanceUntilNextDate: 1
        });
      }
    }
  }

  // Insert logs (use createMany for speed)
  if (logsToCreate.length) {
    // Prisma's createMany requires flat keys matching model fields
    await prisma.log.createMany({ data: logsToCreate, skipDuplicates: true });
  }

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
