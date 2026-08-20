const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

// ⚠️ ضع توكين البوت الخاص بك هنا بين التنصيص
const BOT_TOKEN = 'ضع_هنا_TOKEN_البوت_الخاص_بك';

// الأيدي الخاص بك كـ أدمن
const ADMIN_ID = 5478069124;

const bot = new Telegraf(BOT_TOKEN);
const DATA_FILE = path.join(__dirname, 'data.json');

// حالة جلسة الأدمن عند إضافة ملف جديد
const adminSessions = {};

// دالة قراءة البيانات
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { course1: [], course2: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { course1: [], course2: [] };
  }
}

// دالة حفظ البيانات
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// الشاشة الرئيسية /start
bot.start((ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  const keyboard = [
    [Markup.button.callback('📘 الكورس الأول', 'menu_c1')],
    [Markup.button.callback('📗 الكورس الثاني', 'menu_c2')]
  ];

  if (isAdmin) {
    keyboard.push([Markup.button.callback('⚙️ لوحة إدارة الأدمن', 'admin_panel')]);
  }

  ctx.reply(
    `أهلاً بك في **بوت الدور الثاني** 📚\n\nاختر الكورس المطلوب للوصول إلى المنهج والملازم:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    }
  );
});

// العودة للقائمة الرئيسية
bot.action('main_menu', (ctx) => {
  ctx.answerCbQuery();
  const isAdmin = ctx.from.id === ADMIN_ID;
  const keyboard = [
    [Markup.button.callback('📘 الكورس الأول', 'menu_c1')],
    [Markup.button.callback('📗 الكورس الثاني', 'menu_c2')]
  ];

  if (isAdmin) {
    keyboard.push([Markup.button.callback('⚙️ لوحة إدارة الأدمن', 'admin_panel')]);
  }

  ctx.editMessageText(
    `أهلاً بك في **بوت الدور الثاني** 📚\n\nاختر الكورس المطلوب للوصول إلى المنهج والملازم:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard)
    }
  );
});

// عرض قائمة الكورس الأول
bot.action('menu_c1', (ctx) => {
  ctx.answerCbQuery();
  const data = loadData();
  const buttons = [
    [Markup.button.callback('📖 منهج الكورس الأول', 'curriculum_c1')]
  ];

  data.course1.forEach((item, index) => {
    buttons.push([Markup.button.callback(`📄 ${item.title}`, `get_file_c1_${index}`)]);
  });

  buttons.push([Markup.button.callback('🔙 العودة للقائمة الرئيسية', 'main_menu')]);

  ctx.editMessageText('📂 **قسم الكورس الأول**\nاختر المادة أو المنهج من الأزرار أدناه:', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
});

// عرض قائمة الكورس الثاني
bot.action('menu_c2', (ctx) => {
  ctx.answerCbQuery();
  const data = loadData();
  const buttons = [
    [Markup.button.callback('📖 منهج الكورس الثاني', 'curriculum_c2')]
  ];

  data.course2.forEach((item, index) => {
    buttons.push([Markup.button.callback(`📄 ${item.title}`, `get_file_c2_${index}`)]);
  });

  buttons.push([Markup.button.callback('🔙 العودة للقائمة الرئيسية', 'main_menu')]);

  ctx.editMessageText('📂 **قسم الكورس الثاني**\nاختر المادة أو المنهج من الأزرار أدناه:', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
});

// زر منهج الكورس الأول
bot.action('curriculum_c1', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📚 **منهج الكورس الأول:**\nيتضمن جميع المواضيع والمواد المقررة للدور الثاني.');
});

// زر منهج الكورس الثاني
bot.action('curriculum_c2', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📚 **منهج الكورس الثاني:**\nيتضمن جميع المواضيع والمواد المقررة للدور الثاني.');
});

// إرسال الملفات المضافة بالكورس الأول
bot.action(/^get_file_c1_(\d+)$/, (ctx) => {
  ctx.answerCbQuery();
  const index = parseInt(ctx.match[1]);
  const data = loadData();
  const item = data.course1[index];

  if (item) {
    ctx.replyWithDocument(item.file_id, { caption: `📚 ${item.title}` });
  } else {
    ctx.reply('⚠️ الملف غير موجود أو تم حذفه.');
  }
});

// إرسال الملفات المضافة بالكورس الثاني
bot.action(/^get_file_c2_(\d+)$/, (ctx) => {
  ctx.answerCbQuery();
  const index = parseInt(ctx.match[1]);
  const data = loadData();
  const item = data.course2[index];

  if (item) {
    ctx.replyWithDocument(item.file_id, { caption: `📚 ${item.title}` });
  } else {
    ctx.reply('⚠️ الملف غير موجود أو تم حذفه.');
  }
});

// ==================== لوحة الأدمن والتحكم ==================== //

bot.action('admin_panel', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery('غير مصرح لك.');
  ctx.answerCbQuery();

  const keyboard = [
    [Markup.button.callback('➕ إضافة ملزمة للكورس الأول', 'add_c1')],
    [Markup.button.callback('➕ إضافة ملزمة للكورس الثاني', 'add_c2')],
    [Markup.button.callback('🗑️ حذف ملزمة من الكورس الأول', 'del_c1')],
    [Markup.button.callback('🗑️ حذف ملزمة من الكورس الثاني', 'del_c2')],
    [Markup.button.callback('🔙 العودة للرئيسية', 'main_menu')]
  ];

  ctx.editMessageText('⚙️ **لوحة التحكم بالأدمن**\nيمكنك إضافة أو حذف أزرار الملازم مباشرة من هنا:', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(keyboard)
  });
});

// بدء إضافة ملزمة
bot.action('add_c1', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.answerCbQuery();
  adminSessions[ctx.from.id] = { step: 'WAITING_TITLE', course: 'course1' };
  ctx.reply('📝 أرسل الآن **عنوان/اسم الزر** للـ ملزمة الجديدة (مثال: ملزمة الكيمياء - الفصل الأول):');
});

bot.action('add_c2', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.answerCbQuery();
  adminSessions[ctx.from.id] = { step: 'WAITING_TITLE', course: 'course2' };
  ctx.reply('📝 أرسل الآن **عنوان/اسم الزر** للـ ملزمة الجديدة (مثال: ملزمة الأحياء - الفصل الثاني):');
});

// التعامل مع الرسائل النصية والملفات المرسلة من الأدمن
bot.on('text', (ctx) => {
  const session = adminSessions[ctx.from.id];
  if (!session || ctx.from.id !== ADMIN_ID) return;

  if (session.step === 'WAITING_TITLE') {
    session.title = ctx.message.text;
    session.step = 'WAITING_FILE';
    ctx.reply(`✅ تم اعتماد العنوان: **"${session.title}"**\n\nالآن قم بإرسال ملف الـ PDF الخاص بالملزمة:`, { parse_mode: 'Markdown' });
  }
});

bot.on('document', (ctx) => {
  const session = adminSessions[ctx.from.id];
  if (!session || ctx.from.id !== ADMIN_ID) return;

  if (session.step === 'WAITING_FILE') {
    const fileId = ctx.message.document.file_id;
    const data = loadData();

    data[session.course].push({
      title: session.title,
      file_id: fileId
    });

    saveData(data);
    delete adminSessions[ctx.from.id];

    ctx.reply(`🎉 **تمت الإضافة بنجاح!**\nتم إنشاء زر جديد باسم "${session.title}" وربطه بالملف المرفق.`, { parse_mode: 'Markdown' });
  }
});

// حذف ملازم
bot.action('del_c1', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.answerCbQuery();
  const data = loadData();
  if (data.course1.length === 0) return ctx.reply('لا توجد ملازم مضافة في الكورس الأول للحذف.');

  const buttons = data.course1.map((item, index) => [
    Markup.button.callback(`❌ حذف: ${item.title}`, `confirm_del_c1_${index}`)
  ]);
  buttons.push([Markup.button.callback('🔙 العودة للوحة الأدمن', 'admin_panel')]);

  ctx.editMessageText('اختر الملزمة التي تريد حذفها:', Markup.inlineKeyboard(buttons));
});

bot.action('del_c2', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.answerCbQuery();
  const data = loadData();
  if (data.course2.length === 0) return ctx.reply('لا توجد ملازم مضافة في الكورس الثاني للحذف.');

  const buttons = data.course2.map((item, index) => [
    Markup.button.callback(`❌ حذف: ${item.title}`, `confirm_del_c2_${index}`)
  ]);
  buttons.push([Markup.button.callback('🔙 العودة للوحة الأدمن', 'admin_panel')]);

  ctx.editMessageText('اختر الملزمة التي تريد حذفها:', Markup.inlineKeyboard(buttons));
});

bot.action(/^confirm_del_c1_(\d+)$/, (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.answerCbQuery();
  const index = parseInt(ctx.match[1]);
  const data = loadData();
  const removed = data.course1.splice(index, 1);
  saveData(data);
  ctx.reply(`✅ تم حذف الزر والملزمة: ${removed[0]?.title}`);
});

bot.action(/^confirm_del_c2_(\d+)$/, (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  ctx.answerCbQuery();
  const index = parseInt(ctx.match[1]);
  const data = loadData();
  const removed = data.course2.splice(index, 1);
  saveData(data);
  ctx.reply(`✅ تم حذف الزر والملزمة: ${removed[0]?.title}`);
});

// تشغيل البوت
bot.launch().then(() => {
  console.log('🤖 البوت يعمل بنجاح الآن!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
