// src/services/databaseService.js
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isWeb = Platform.OS === 'web';
    this.webData = {
      categories: [],
      quizzes: [],
      questions: [],
      device_scores: []
    };
  }

  async initialize() {
    if (this.isWeb) {
      // Web platform - use in-memory storage
      console.log('Web platform detected - using in-memory storage');
      return { isWeb: true };
    }
    
    if (this.db) return this.db;
    
    try {
      this.db = await SQLite.openDatabaseAsync('quiz_app.db');
      await this.createTables();
      return this.db;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const db = await this.initialize();
    
    try {
      // Categories table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Quizzes table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        );
      `);

      // Questions table with enhanced format support
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quiz_id INTEGER NOT NULL,
          question_text TEXT NOT NULL,
          answer_options TEXT NOT NULL, -- JSON string
          correct_answer INTEGER, -- Legacy support
          shuffle_answers BOOLEAN DEFAULT 1,
          multiple_correct BOOLEAN DEFAULT 0,
          explanation TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        );
      `);

      // Device scores table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS device_scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id TEXT NOT NULL,
          quiz_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        );
      `);

      // Create indexes for better performance
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_quizzes_category_id ON quizzes(category_id);
        CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
        CREATE INDEX IF NOT EXISTS idx_device_scores_device_quiz ON device_scores(device_id, quiz_id);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Failed to create database tables:', error);
      throw error;
    }
  }

  // Generic query methods that mimic Supabase API
  from(tableName) {
    return {
      select: async (columns = '*') => {
        try {
          if (this.isWeb) {
            // Web platform - return from in-memory data
            const result = this.webData[tableName] || [];
            return { data: result, error: null };
          }
          
          const db = await this.initialize();
          const query = `SELECT ${columns} FROM ${tableName}`;
          const result = await db.getAllAsync(query);
          return { data: result, error: null };
        } catch (error) {
          console.error(`Select error from ${tableName}:`, error);
          return { data: null, error };
        }
      },

      insert: async (data) => {
        try {
          if (this.isWeb) {
            // Web platform - add to in-memory data
            const newId = (this.webData[tableName].length + 1);
            const insertedData = { ...data, id: newId };
            this.webData[tableName].push(insertedData);
            return { data: insertedData, error: null };
          }
          
          const db = await this.initialize();
          const keys = Object.keys(data);
          const values = Object.values(data);
          const placeholders = values.map(() => '?').join(',');
          
          const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
          const result = await db.runAsync(query, values);
          
          // Return the inserted data with the new ID
          const insertedData = { ...data, id: result.lastInsertRowId };
          return { data: insertedData, error: null };
        } catch (error) {
          console.error(`Insert error into ${tableName}:`, error);
          return { data: null, error };
        }
      },

      update: async (data) => {
        return {
          eq: async (column, value) => {
            try {
              const db = await this.initialize();
              const keys = Object.keys(data);
              const values = Object.values(data);
              const setClause = keys.map(key => `${key} = ?`).join(', ');
              
              const query = `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${column} = ?`;
              await db.runAsync(query, [...values, value]);
              
              return { error: null };
            } catch (error) {
              console.error(`Update error in ${tableName}:`, error);
              return { error };
            }
          }
        };
      },

      delete: () => {
        return {
          eq: async (column, value) => {
            try {
              const db = await this.initialize();
              const query = `DELETE FROM ${tableName} WHERE ${column} = ?`;
              await db.runAsync(query, [value]);
              return { error: null };
            } catch (error) {
              console.error(`Delete error from ${tableName}:`, error);
              return { error };
            }
          }
        };
      }
    };
  }

  // Specialized methods for complex queries
  async getDeviceScores(deviceId) {
    try {
      if (this.isWeb) {
        // Web platform - filter in-memory data
        const result = this.webData.device_scores.filter(score => score.device_id === deviceId);
        return { data: result, error: null };
      }
      
      const db = await this.initialize();
      const query = `SELECT quiz_id, score FROM device_scores WHERE device_id = ?`;
      const result = await db.getAllAsync(query, [deviceId]);
      return { data: result, error: null };
    } catch (error) {
      console.error('Error getting device scores:', error);
      return { data: null, error };
    }
  }

  async insertDeviceScore(deviceId, quizId, score) {
    try {
      if (this.isWeb) {
        // Web platform - add to in-memory data
        const newScore = {
          id: this.webData.device_scores.length + 1,
          device_id: deviceId,
          quiz_id: quizId,
          score: score
        };
        this.webData.device_scores.push(newScore);
        return { data: { id: newScore.id }, error: null };
      }
      
      const db = await this.initialize();
      const query = `INSERT INTO device_scores (device_id, quiz_id, score) VALUES (?, ?, ?)`;
      const result = await db.runAsync(query, [deviceId, quizId, score]);
      return { data: { id: result.lastInsertRowId }, error: null };
    } catch (error) {
      console.error('Error inserting device score:', error);
      return { data: null, error };
    }
  }

  async deleteDeviceScores(deviceId) {
    try {
      if (this.isWeb) {
        // Web platform - filter out scores for this device
        this.webData.device_scores = this.webData.device_scores.filter(score => score.device_id !== deviceId);
        return { error: null };
      }
      
      const db = await this.initialize();
      const query = `DELETE FROM device_scores WHERE device_id = ?`;
      await db.runAsync(query, [deviceId]);
      return { error: null };
    } catch (error) {
      console.error('Error deleting device scores:', error);
      return { error };
    }
  }

  // Bulk insert method for questions
  async insertQuestions(questions) {
    try {
      if (this.isWeb) {
        // Web platform - add to in-memory data
        questions.forEach((question, index) => {
          const { quiz_id, question_text, answer_options, correct_answer } = question;
          const newQuestion = {
            id: this.webData.questions.length + index + 1,
            quiz_id,
            question_text,
            answer_options: JSON.stringify(answer_options),
            correct_answer
          };
          this.webData.questions.push(newQuestion);
        });
        return { error: null };
      }
      
      const db = await this.initialize();
      
      const insertPromises = questions.map(question => {
        const { quiz_id, question_text, answer_options, correct_answer } = question;
        const query = `INSERT INTO questions (quiz_id, question_text, answer_options, correct_answer) VALUES (?, ?, ?, ?)`;
        return db.runAsync(query, [quiz_id, question_text, JSON.stringify(answer_options), correct_answer]);
      });

      await Promise.all(insertPromises);
      return { error: null };
    } catch (error) {
      console.error('Error bulk inserting questions:', error);
      return { error };
    }
  }

  // Method to seed initial data
  async seedInitialData() {
    try {
      const db = await this.initialize();
      
      // Check if categories already exist
      if (this.isWeb) {
        // Web platform - check in-memory data
        if (this.webData.categories.length > 0) {
          console.log('Web database already seeded');
          return;
        }
      } else {
        // Mobile platform - check SQLite
        const existingCategories = await db.getAllAsync('SELECT COUNT(*) as count FROM categories');
        if (existingCategories[0].count > 0) {
          console.log('Database already seeded');
          return;
        }
      }

      // Try to import from JSON files first (for migrated data)
      const importSuccess = await this.importFromJsonFiles();
      if (importSuccess) {
        console.log('Data imported from JSON files successfully');
        return;
      }

      // Fallback to default categories if no import files found
      console.log('No import files found, seeding default categories...');
      const categories = [
        { name: 'General Knowledge', description: 'Test your general knowledge', icon: 'brain' },
        { name: 'Science', description: 'Science and technology questions', icon: 'flask' },
        { name: 'History', description: 'Historical events and figures', icon: 'book' },
        { name: 'Geography', description: 'Countries, capitals, and landmarks', icon: 'map' }
      ];

      if (this.isWeb) {
        // Web platform - add to in-memory data
        this.webData.categories = categories.map((cat, index) => ({
          ...cat,
          id: index + 1
        }));
      } else {
        // Mobile platform - insert into SQLite
        for (const category of categories) {
          await db.runAsync(
            'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
            [category.name, category.description, category.icon]
          );
        }
      }

      console.log('Default data seeded successfully');
    } catch (error) {
      console.error('Error seeding initial data:', error);
      throw error;
    }
  }

  // Import data from JSON files (for Supabase migration)
  async importFromJsonFiles() {
    try {
      // This is a simplified version - in a real React Native app,
      // you'd need to bundle these files with the app or download them
      console.log('Looking for import JSON files...');
      
      // Comprehensive JW Quiz Database
      const sampleData = {
        categories: [
          { name: 'Bible Books & Accounts', description: 'Questions about Bible books, creation, and key events', icon: 'book' },
          { name: 'Bible Characters', description: 'Learn about faithful men and women in the Bible', icon: 'people' },
          { name: 'Christian Living', description: 'Practical application of Bible principles', icon: 'heart' },
          { name: 'Prophecy & End Times', description: 'Bible prophecies and signs of the last days', icon: 'eye' },
          { name: 'Jesus Christ', description: 'Life, ministry, and teachings of Jesus', icon: 'star' },
          { name: 'Bible Teachings', description: 'Core Bible doctrines and principles', icon: 'lightbulb' }
        ],
        quizzes: [
          // Bible Books & Accounts (Category 1)
          { title: 'Genesis & Creation', description: 'The beginning of all things', category_id: 1 },
          { title: 'Exodus & Moses', description: 'Israel\'s deliverance from Egypt', category_id: 1 },
          { title: 'Psalms & Proverbs', description: 'Wisdom literature of the Bible', category_id: 1 },
          { title: 'The Gospels', description: 'Good news about Jesus Christ', category_id: 1 },
          
          // Bible Characters (Category 2)
          { title: 'Faithful Men', description: 'Examples of faithful Bible men', category_id: 2 },
          { title: 'Faithful Women', description: 'Examples of faithful Bible women', category_id: 2 },
          { title: 'Kings & Leaders', description: 'Israel\'s kings and faithful leaders', category_id: 2 },
          
          // Christian Living (Category 3)
          { title: 'Prayer & Worship', description: 'How to approach God in worship', category_id: 3 },
          { title: 'Family Life', description: 'Bible principles for family happiness', category_id: 3 },
          { title: 'Christian Qualities', description: 'Fruits of God\'s spirit', category_id: 3 },
          
          // Prophecy & End Times (Category 4)
          { title: 'Daniel\'s Prophecies', description: 'Understanding Daniel\'s visions', category_id: 4 },
          { title: 'Revelation', description: 'The grand climax at hand', category_id: 4 },
          { title: 'Signs of the Last Days', description: 'Evidence we\'re in the last days', category_id: 4 },
          
          // Jesus Christ (Category 5)
          { title: 'Jesus\' Ministry', description: 'Christ\'s earthly ministry and miracles', category_id: 5 },
          { title: 'Jesus\' Teachings', description: 'The greatest teacher\'s lessons', category_id: 5 },
          
          // Bible Teachings (Category 6)
          { title: 'God\'s Name & Nature', description: 'Getting to know Jehovah', category_id: 6 },
          { title: 'Bible Truths', description: 'Core Bible teachings', category_id: 6 }
        ],
        questions: [
          // Genesis & Creation (Quiz 1)
          { quiz_id: 1, question_text: 'Who was the first human created by God?', answer_options: ['Adam', 'Eve', 'Cain', 'Abel'], correct_answer: 0 },
          { quiz_id: 1, question_text: 'What did God create on the first day?', answer_options: ['Animals', 'Light', 'Plants', 'Humans'], correct_answer: 1 },
          { quiz_id: 1, question_text: 'How many days did God take to create everything?', answer_options: ['Five days', 'Six days', 'Seven days', 'Eight days'], correct_answer: 1 },
          { quiz_id: 1, question_text: 'What was the name of the garden where Adam and Eve lived?', answer_options: ['Garden of Gethsemane', 'Garden of Eden', 'Garden of Olives', 'Garden of Peace'], correct_answer: 1 },
          { quiz_id: 1, question_text: 'Which tree were Adam and Eve told not to eat from?', answer_options: ['Tree of Life', 'Tree of Knowledge of Good and Bad', 'Olive Tree', 'Fig Tree'], correct_answer: 1 },
          { quiz_id: 1, question_text: 'Who were Adam and Eve\'s first two sons?', answer_options: ['Cain and Abel', 'Jacob and Esau', 'Isaac and Ishmael', 'Ephraim and Manasseh'], correct_answer: 0 },
          { quiz_id: 1, question_text: 'How long did people live before the flood?', answer_options: ['120 years', 'About 900 years', '70-80 years', '200 years'], correct_answer: 1 },
          { quiz_id: 1, question_text: 'Who was "a mighty hunter in opposition to Jehovah"?', answer_options: ['Nimrod', 'Lamech', 'Tubal-Cain', 'Jabal'], correct_answer: 0 },
          { quiz_id: 1, question_text: 'What was God\'s covenant sign to Noah?', answer_options: ['A dove', 'The rainbow', 'An olive branch', 'The ark'], correct_answer: 1 },
          { quiz_id: 1, question_text: 'Who was Abraham\'s nephew that lived in Sodom?', answer_options: ['Isaac', 'Lot', 'Jacob', 'Laban'], correct_answer: 1 },

          // Exodus & Moses (Quiz 2)
          { quiz_id: 2, question_text: 'In what country were the Israelites enslaved?', answer_options: ['Babylon', 'Assyria', 'Egypt', 'Philistia'], correct_answer: 2 },
          { quiz_id: 2, question_text: 'What was Moses doing when God spoke to him from the burning bush?', answer_options: ['Shepherding', 'Fishing', 'Farming', 'Teaching'], correct_answer: 0 },
          { quiz_id: 2, question_text: 'How many plagues did God bring upon Egypt?', answer_options: ['7', '10', '12', '14'], correct_answer: 1 },
          { quiz_id: 2, question_text: 'What was the final plague upon Egypt?', answer_options: ['Darkness', 'Hail', 'Death of firstborn', 'Locusts'], correct_answer: 2 },
          { quiz_id: 2, question_text: 'What did the Israelites put on their doorposts during the Passover?', answer_options: ['Oil', 'Lamb\'s blood', 'Water', 'Flour'], correct_answer: 1 },
          { quiz_id: 2, question_text: 'How did God part the Red Sea?', answer_options: ['With Moses\' staff', 'With a strong east wind', 'Miraculously', 'All of the above'], correct_answer: 3 },
          { quiz_id: 2, question_text: 'What did God give the Israelites to eat in the wilderness?', answer_options: ['Manna and quail', 'Bread and fish', 'Fruit and vegetables', 'Meat and grain'], correct_answer: 0 },
          { quiz_id: 2, question_text: 'On what mountain did Moses receive the Law?', answer_options: ['Mount Ararat', 'Mount Sinai', 'Mount Carmel', 'Mount Zion'], correct_answer: 1 },
          { quiz_id: 2, question_text: 'How many commandments did God give to Moses?', answer_options: ['7', '10', '12', '613'], correct_answer: 1 },
          { quiz_id: 2, question_text: 'What did the Israelites make to worship while Moses was on the mountain?', answer_options: ['A silver serpent', 'A golden calf', 'A bronze altar', 'A wooden pole'], correct_answer: 1 },

          // Psalms & Proverbs (Quiz 3)
          { quiz_id: 3, question_text: 'Who wrote most of the Psalms?', answer_options: ['Solomon', 'David', 'Moses', 'Asaph'], correct_answer: 1 },
          { quiz_id: 3, question_text: 'Complete this verse: "Jehovah is my shepherd, I will lack..."', answer_options: ['nothing', 'peace', 'strength', 'wisdom'], correct_answer: 0 },
          { quiz_id: 3, question_text: 'Which Psalm is known as the "Shepherd Psalm"?', answer_options: ['Psalm 1', 'Psalm 23', 'Psalm 51', 'Psalm 119'], correct_answer: 1 },
          { quiz_id: 3, question_text: 'Who wrote most of the book of Proverbs?', answer_options: ['David', 'Solomon', 'Moses', 'Daniel'], correct_answer: 1 },
          { quiz_id: 3, question_text: '"The fear of Jehovah is the beginning of..."', answer_options: ['wisdom', 'knowledge', 'understanding', 'All of the above'], correct_answer: 3 },
          { quiz_id: 3, question_text: 'According to Proverbs, what should you trust in with all your heart?', answer_options: ['Your understanding', 'Jehovah', 'Your strength', 'Your friends'], correct_answer: 1 },
          { quiz_id: 3, question_text: 'Proverbs says the wise person does what with reproof?', answer_options: ['Rejects it', 'Accepts it', 'Questions it', 'Ignores it'], correct_answer: 1 },
          { quiz_id: 3, question_text: '"A word spoken at the right time is like..."', answer_options: ['Silver', 'Gold apples in silver settings', 'Precious stones', 'Pure water'], correct_answer: 1 },

          // The Gospels (Quiz 4)
          { quiz_id: 4, question_text: 'How many Gospel accounts are in the Bible?', answer_options: ['3', '4', '5', '6'], correct_answer: 1 },
          { quiz_id: 4, question_text: 'Which Gospel was written by a tax collector?', answer_options: ['Matthew', 'Mark', 'Luke', 'John'], correct_answer: 0 },
          { quiz_id: 4, question_text: 'Which Gospel emphasizes Jesus as the Son of God?', answer_options: ['Matthew', 'Mark', 'Luke', 'John'], correct_answer: 3 },
          { quiz_id: 4, question_text: 'In which city was Jesus born?', answer_options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'], correct_answer: 2 },
          { quiz_id: 4, question_text: 'Who baptized Jesus?', answer_options: ['John the Baptist', 'Peter', 'Andrew', 'Philip'], correct_answer: 0 },
          { quiz_id: 4, question_text: 'How long did Jesus fast in the wilderness?', answer_options: ['30 days', '40 days', '50 days', '60 days'], correct_answer: 1 },

          // Faithful Men (Quiz 5)
          { quiz_id: 5, question_text: 'Who was called "a friend of God"?', answer_options: ['Noah', 'Abraham', 'David', 'Daniel'], correct_answer: 1 },
          { quiz_id: 5, question_text: 'Who built the ark?', answer_options: ['Abraham', 'Noah', 'Moses', 'Joshua'], correct_answer: 1 },
          { quiz_id: 5, question_text: 'Who was swallowed by a great fish?', answer_options: ['Jonah', 'Elijah', 'Jeremiah', 'Ezekiel'], correct_answer: 0 },
          { quiz_id: 5, question_text: 'Who interpreted dreams for Pharaoh?', answer_options: ['Daniel', 'Joseph', 'Moses', 'Aaron'], correct_answer: 1 },
          { quiz_id: 5, question_text: 'Who was taken to heaven in a whirlwind?', answer_options: ['Enoch', 'Elijah', 'Moses', 'Isaiah'], correct_answer: 1 },
          { quiz_id: 5, question_text: 'Who was thrown into the lion\'s den?', answer_options: ['Daniel', 'Jeremiah', 'Ezekiel', 'Isaiah'], correct_answer: 0 },
          { quiz_id: 5, question_text: 'Who was the strongest man in the Bible?', answer_options: ['Goliath', 'Samson', 'David', 'Joshua'], correct_answer: 1 },
          { quiz_id: 5, question_text: 'Who led the Israelites after Moses died?', answer_options: ['Aaron', 'Caleb', 'Joshua', 'Samuel'], correct_answer: 2 },

          // Faithful Women (Quiz 6)
          { quiz_id: 6, question_text: 'Who was the mother of Samuel?', answer_options: ['Ruth', 'Naomi', 'Hannah', 'Rachel'], correct_answer: 2 },
          { quiz_id: 6, question_text: 'Which woman helped the Israelite spies in Jericho?', answer_options: ['Rahab', 'Deborah', 'Esther', 'Miriam'], correct_answer: 0 },
          { quiz_id: 6, question_text: 'Who was Ruth\'s mother-in-law?', answer_options: ['Hannah', 'Naomi', 'Rachel', 'Leah'], correct_answer: 1 },
          { quiz_id: 6, question_text: 'Which woman became queen of Persia?', answer_options: ['Vashti', 'Esther', 'Ruth', 'Abigail'], correct_answer: 1 },
          { quiz_id: 6, question_text: 'Who was the mother of Moses?', answer_options: ['Miriam', 'Jochebed', 'Zipporah', 'Deborah'], correct_answer: 1 },
          { quiz_id: 6, question_text: 'Which woman was a judge in Israel?', answer_options: ['Miriam', 'Deborah', 'Hannah', 'Ruth'], correct_answer: 1 },
          { quiz_id: 6, question_text: 'Who said "Where you go I will go"?', answer_options: ['Rachel', 'Ruth', 'Esther', 'Hannah'], correct_answer: 1 },
          { quiz_id: 6, question_text: 'Who was Abraham\'s wife?', answer_options: ['Sarah', 'Rebecca', 'Rachel', 'Leah'], correct_answer: 0 },

          // Kings & Leaders (Quiz 7)
          { quiz_id: 7, question_text: 'Who was Israel\'s first king?', answer_options: ['David', 'Saul', 'Solomon', 'Samuel'], correct_answer: 1 },
          { quiz_id: 7, question_text: 'Who killed Goliath?', answer_options: ['Saul', 'Jonathan', 'David', 'Samuel'], correct_answer: 2 },
          { quiz_id: 7, question_text: 'Who was known as the wisest king?', answer_options: ['David', 'Saul', 'Solomon', 'Hezekiah'], correct_answer: 2 },
          { quiz_id: 7, question_text: 'Who built the first temple in Jerusalem?', answer_options: ['David', 'Solomon', 'Hezekiah', 'Josiah'], correct_answer: 1 },
          { quiz_id: 7, question_text: 'Which king had the kingdom divided after his death?', answer_options: ['David', 'Solomon', 'Saul', 'Hezekiah'], correct_answer: 1 },
          { quiz_id: 7, question_text: 'Who was king when Jerusalem was destroyed by Babylon?', answer_options: ['Josiah', 'Jehoiakim', 'Zedekiah', 'Hezekiah'], correct_answer: 2 },

          // Prayer & Worship (Quiz 8)
          { quiz_id: 8, question_text: 'What did Jesus teach his disciples to pray?', answer_options: ['The Lord\'s Prayer', 'Our Father', 'Model Prayer', 'All of the above'], correct_answer: 3 },
          { quiz_id: 8, question_text: 'How did Jesus say we should pray?', answer_options: ['Loudly', 'In private', 'With others', 'All are acceptable'], correct_answer: 3 },
          { quiz_id: 8, question_text: 'What name did Jesus teach us to pray to?', answer_options: ['God', 'Father', 'Our Father in heaven', 'Jehovah'], correct_answer: 2 },
          { quiz_id: 8, question_text: 'According to Jesus, where are two or three gathered?', answer_options: ['In a church', 'In his name', 'For worship', 'To pray'], correct_answer: 1 },
          { quiz_id: 8, question_text: 'What did Jesus say is the greatest commandment?', answer_options: ['Love your neighbor', 'Love God with whole heart', 'Keep the Sabbath', 'Honor parents'], correct_answer: 1 },
          { quiz_id: 8, question_text: 'What is the second greatest commandment?', answer_options: ['Keep the Law', 'Love your neighbor', 'Worship God only', 'Remember the Sabbath'], correct_answer: 1 },

          // Family Life (Quiz 9)
          { quiz_id: 9, question_text: 'What does the Bible say about honoring parents?', answer_options: ['It\'s optional', 'Only if they\'re good', 'It\'s a command', 'Only when young'], correct_answer: 2 },
          { quiz_id: 9, question_text: 'How should husbands treat their wives?', answer_options: ['As servants', 'As equals', 'With love and honor', 'With authority'], correct_answer: 2 },
          { quiz_id: 9, question_text: 'What does "training up a child" involve?', answer_options: ['Physical discipline only', 'Bible education', 'Secular education', 'Sports training'], correct_answer: 1 },
          { quiz_id: 9, question_text: 'According to Ephesians, children should do what?', answer_options: ['Obey parents', 'Honor parents', 'Both A and B', 'Neither A nor B'], correct_answer: 2 },
          { quiz_id: 9, question_text: 'What quality should Christian families show?', answer_options: ['Competition', 'Love', 'Perfection', 'Wealth'], correct_answer: 1 },

          // Christian Qualities (Quiz 10)
          { quiz_id: 10, question_text: 'What are the fruits of God\'s spirit?', answer_options: ['9 qualities', '7 qualities', '12 qualities', '10 qualities'], correct_answer: 0 },
          { quiz_id: 10, question_text: 'What is the first fruit of the spirit mentioned?', answer_options: ['Joy', 'Peace', 'Love', 'Patience'], correct_answer: 2 },
          { quiz_id: 10, question_text: 'Which quality means "long-suffering"?', answer_options: ['Patience', 'Kindness', 'Goodness', 'Mildness'], correct_answer: 0 },
          { quiz_id: 10, question_text: 'What does "self-control" help us do?', answer_options: ['Control others', 'Control our desires', 'Control situations', 'Control outcomes'], correct_answer: 1 },
          { quiz_id: 10, question_text: 'How can we develop Christian qualities?', answer_options: ['Study and prayer', 'Practice', 'God\'s spirit', 'All of the above'], correct_answer: 3 },

          // Daniel's Prophecies (Quiz 11)
          { quiz_id: 11, question_text: 'What did Nebuchadnezzar\'s dream image represent?', answer_options: ['Different gods', 'World powers', 'Babylon\'s glory', 'Future kings'], correct_answer: 1 },
          { quiz_id: 11, question_text: 'What destroyed the image in the dream?', answer_options: ['Fire', 'Water', 'A stone', 'Wind'], correct_answer: 2 },
          { quiz_id: 11, question_text: 'How long are the "seven times" of Daniel chapter 4?', answer_options: ['7 years', '2,520 years', '70 years', '7 months'], correct_answer: 1 },
          { quiz_id: 11, question_text: 'What did the writing on the wall say to Belshazzar?', answer_options: ['MENE MENE TEKEL PARSIN', 'God is great', 'Babylon will fall', 'Repent now'], correct_answer: 0 },
          { quiz_id: 11, question_text: 'When did the "seven times" end?', answer_options: ['1914 C.E.', '1918 C.E.', '1925 C.E.', '1975 C.E.'], correct_answer: 0 },

          // Revelation (Quiz 12)
          { quiz_id: 12, question_text: 'Who wrote the book of Revelation?', answer_options: ['Paul', 'Peter', 'John', 'Luke'], correct_answer: 2 },
          { quiz_id: 12, question_text: 'How many congregations received letters in Revelation?', answer_options: ['5', '7', '12', '24'], correct_answer: 1 },
          { quiz_id: 12, question_text: 'What do the 144,000 represent?', answer_options: ['All Christians', 'Heavenly rulers', 'Earthly survivors', 'Angels'], correct_answer: 1 },
          { quiz_id: 12, question_text: 'What is the "great crowd"?', answer_options: ['The 144,000', 'Earthly survivors', 'Angels', 'Past faithful ones'], correct_answer: 1 },
          { quiz_id: 12, question_text: 'What does "Babylon the Great" represent?', answer_options: ['Ancient Babylon', 'False religion', 'Political powers', 'Commercial system'], correct_answer: 1 },

          // Signs of the Last Days (Quiz 13)
          { quiz_id: 13, question_text: 'What did Jesus say would be a sign of the last days?', answer_options: ['Earthquakes', 'Wars', 'Food shortages', 'All of the above'], correct_answer: 3 },
          { quiz_id: 13, question_text: 'When did the last days begin?', answer_options: ['33 C.E.', '1914 C.E.', '1918 C.E.', '1925 C.E.'], correct_answer: 1 },
          { quiz_id: 13, question_text: 'What happens during the "great tribulation"?', answer_options: ['Armageddon', 'Babylon\'s destruction', 'Satan\'s end', 'All false religion destroyed'], correct_answer: 3 },
          { quiz_id: 13, question_text: 'Who will survive Armageddon?', answer_options: ['All people', 'Only JWs', 'God decides', 'The righteous'], correct_answer: 2 },

          // Jesus' Ministry (Quiz 14)
          { quiz_id: 14, question_text: 'What was the first miracle Jesus performed?', answer_options: ['Healing a blind man', 'Walking on water', 'Turning water into wine', 'Feeding 5,000'], correct_answer: 2 },
          { quiz_id: 14, question_text: 'How many disciples did Jesus choose?', answer_options: ['10', '12', '70', '120'], correct_answer: 1 },
          { quiz_id: 14, question_text: 'Where did Jesus give the Sermon on the Mount?', answer_options: ['On a mountain', 'By the sea', 'In the temple', 'In Capernaum'], correct_answer: 0 },
          { quiz_id: 14, question_text: 'What did Jesus say about himself?', answer_options: ['I am God', 'I am the way, truth, life', 'I am equal to God', 'I am the creator'], correct_answer: 1 },
          { quiz_id: 14, question_text: 'How long was Jesus\' ministry?', answer_options: ['1 year', '2 years', '3.5 years', '7 years'], correct_answer: 2 },

          // Jesus' Teachings (Quiz 15)
          { quiz_id: 15, question_text: 'Complete this beatitude: "Happy are those who mourn, for they will be..."', answer_options: ['blessed', 'comforted', 'rewarded', 'saved'], correct_answer: 1 },
          { quiz_id: 15, question_text: 'What did Jesus say about the Kingdom of God?', answer_options: ['It\'s in heaven only', 'It\'s in your heart', 'It will rule the earth', 'It\'s not real'], correct_answer: 2 },
          { quiz_id: 15, question_text: 'What is the "good news" Jesus preached?', answer_options: ['God\'s Kingdom', 'Salvation', 'Eternal life', 'All of the above'], correct_answer: 3 },
          { quiz_id: 15, question_text: 'What did Jesus say about making disciples?', answer_options: ['It\'s optional', 'Only for apostles', 'For all Christians', 'Only for elders'], correct_answer: 2 },
          { quiz_id: 15, question_text: 'How should Christians treat enemies?', answer_options: ['Fight them', 'Avoid them', 'Love them', 'Ignore them'], correct_answer: 2 },

          // God's Name & Nature (Quiz 16)
          { quiz_id: 16, question_text: 'What is God\'s personal name?', answer_options: ['God', 'Lord', 'Jehovah', 'Father'], correct_answer: 2 },
          { quiz_id: 16, question_text: 'How many times does God\'s name appear in the Bible?', answer_options: ['About 1,000', 'About 7,000', 'About 10,000', 'About 14,000'], correct_answer: 1 },
          { quiz_id: 16, question_text: 'What does God\'s name mean?', answer_options: ['Almighty', 'Creator', 'He causes to become', 'King'], correct_answer: 2 },
          { quiz_id: 16, question_text: 'What is God\'s outstanding quality?', answer_options: ['Power', 'Justice', 'Love', 'Wisdom'], correct_answer: 2 },
          { quiz_id: 16, question_text: 'Can God lie?', answer_options: ['Yes', 'No', 'Sometimes', 'Only for good'], correct_answer: 1 },

          // Bible Truths (Quiz 17)
          { quiz_id: 17, question_text: 'What happens when we die?', answer_options: ['Go to heaven', 'Go to hell', 'Return to dust', 'Become spirits'], correct_answer: 2 },
          { quiz_id: 17, question_text: 'What is the soul?', answer_options: ['Immortal spirit', 'The living person', 'Part of God', 'Energy force'], correct_answer: 1 },
          { quiz_id: 17, question_text: 'Where will most people live forever?', answer_options: ['Heaven', 'Hell', 'Paradise earth', 'Spirit realm'], correct_answer: 2 },
          { quiz_id: 17, question_text: 'How many will go to heaven?', answer_options: ['All good people', '144,000', 'Millions', 'We don\'t know'], correct_answer: 1 },
          { quiz_id: 17, question_text: 'What is God\'s purpose for the earth?', answer_options: ['To destroy it', 'Paradise forever', 'Testing ground', 'Temporary home'], correct_answer: 1 }
        ]
      };

      const db = await this.initialize();
      console.log('Importing sample JW quiz data...');

      if (this.isWeb) {
        // Web platform - populate in-memory data
        console.log('Web platform: Loading data into memory...');
        this.webData.categories = sampleData.categories.map((cat, index) => ({
          ...cat,
          id: index + 1
        }));
        this.webData.quizzes = sampleData.quizzes.map((quiz, index) => ({
          ...quiz,
          id: index + 1
        }));
        this.webData.questions = sampleData.questions.map((question, index) => ({
          ...question,
          id: index + 1,
          answer_options: JSON.stringify(question.answer_options)
        }));
        
        console.log('Web data loaded successfully!');
        console.log(`Categories: ${this.webData.categories.length}`);
        console.log(`Quizzes: ${this.webData.quizzes.length}`);
        console.log(`Questions: ${this.webData.questions.length}`);
        console.log('Sample categories:', this.webData.categories.slice(0, 2));
        console.log('Sample quizzes:', this.webData.quizzes.slice(0, 3));
        return true;
      }

      // Mobile platform - use SQLite
      // Import categories
      console.log(`Importing ${sampleData.categories.length} categories...`);
      for (const category of sampleData.categories) {
        await db.runAsync(
          'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
          [category.name, category.description, category.icon]
        );
      }

      // Import quizzes
      console.log(`Importing ${sampleData.quizzes.length} quizzes...`);
      for (const quiz of sampleData.quizzes) {
        await db.runAsync(
          'INSERT INTO quizzes (title, description, category_id) VALUES (?, ?, ?)',
          [quiz.title, quiz.description, quiz.category_id]
        );
      }

      // Import questions
      console.log(`Importing ${sampleData.questions.length} questions...`);
      for (const question of sampleData.questions) {
        await db.runAsync(
          'INSERT INTO questions (quiz_id, question_text, answer_options, correct_answer) VALUES (?, ?, ?, ?)',
          [question.quiz_id, question.question_text, JSON.stringify(question.answer_options), question.correct_answer]
        );
      }

      console.log('Sample JW quiz data imported successfully!');
      return true;

    } catch (error) {
      console.log('Could not import from JSON files:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;