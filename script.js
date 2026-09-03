// =====================================================
// VOICE LEDGER
// Voice-first money management application
// =====================================================


// =====================================================
// 1. HTML ELEMENTS
// =====================================================

const incomeTotal =
    document.getElementById("income-total");

const expenseTotal =
    document.getElementById("expense-total");

const balanceTotal =
    document.getElementById("balance-total");

const transactionCount =
    document.getElementById("transaction-count");


const languageSelect =
    document.getElementById("language-select");

const startButton =
    document.getElementById("start-listening");

const stopButton =
    document.getElementById("stop-listening");

const undoButton =
    document.getElementById("undo-last");

const listenStatus =
    document.getElementById("listen-status");

const liveTranscript =
    document.getElementById("live-transcript");

const pendingBuffer =
    document.getElementById("pending-buffer");

const voiceMessage =
    document.getElementById("voice-message");


const manualInput =
    document.getElementById("manual-input");

const processManualButton =
    document.getElementById("process-manual");


const filterSearch =
    document.getElementById("filter-search");

const filterType =
    document.getElementById("filter-type");

const filterCategory =
    document.getElementById("filter-category");

const filterMonth =
    document.getElementById("filter-month");


const transactionList =
    document.getElementById("transaction-list");


const learnedCount =
    document.getElementById("learned-count");

const clearAllButton =
    document.getElementById("clear-all");


// =====================================================
// 2. APP STATE
// =====================================================

let transactions = [];

let learnedCategories = {};

let recognition = null;

let keepListening = false;

let recognitionRunning = false;

let speechBuffer = "";

let processingTimer = null;

let transcriptHistory = [];

let lastProcessedText = "";

let lastProcessedTime = 0;


// How long the app waits after a pause
const PROCESS_DELAY = 1500;


// =====================================================
// 3. CATEGORY DATA
// =====================================================

const categoryDictionary = {

    Food: [
        "chal",
        "chaal",
        "rice",

        "dal",
        "daal",
        "lentil",
        "lentils",

        "food",
        "foods",

        "grocery",
        "groceries",

        "chicken",
        "beef",
        "meat",
        "fish",

        "vegetable",
        "vegetables",

        "milk",
        "egg",
        "eggs",

        "bread",
        "fruit",
        "fruits",

        "lunch",
        "dinner",
        "breakfast",

        "coffee",
        "tea",

        "restaurant",

        "খাবার",
        "চাল",
        "ডাল",
        "মাছ",
        "মাংস",
        "সবজি"
    ],


    Travel: [
        "rickshaw",
        "rikshaw",

        "cng",

        "uber",
        "pathao",

        "bus",
        "train",

        "taxi",

        "fuel",
        "petrol",
        "diesel",

        "travel",
        "transport",

        "রিকশা",
        "বাস",
        "ট্যাক্সি",
        "পেট্রোল"
    ],


    Bills: [
        "internet",
        "wifi",

        "electricity",
        "electric",

        "gas",
        "water",

        "phone bill",
        "mobile bill",

        "recharge",

        "bill",
        "bills",

        "ইন্টারনেট",
        "বিদ্যুৎ",
        "গ্যাস",
        "বিল"
    ],


    Shopping: [
        "shopping",

        "shirt",
        "shirts",

        "dress",
        "clothes",
        "clothing",

        "shoe",
        "shoes",

        "daraz",

        "purchase",

        "কাপড়"
    ],


    Rent: [
        "rent",
        "house rent",
        "office rent",
        "বাসা ভাড়া"
    ],


    Health: [
        "doctor",
        "hospital",

        "medicine",
        "medicines",

        "pharmacy",
        "medical",

        "ডাক্তার",
        "ওষুধ",
        "হাসপাতাল"
    ],


    Education: [
        "school",
        "university",

        "course",
        "training",

        "tuition",
        "book",
        "books",

        "স্কুল",
        "বিশ্ববিদ্যালয়",
        "বই"
    ],


    Entertainment: [
        "movie",
        "cinema",

        "netflix",
        "spotify",

        "game",
        "gaming",

        "entertainment"
    ],


    Salary: [
        "salary",
        "wage",
        "wages",

        "paycheck",

        "beton",
        "বেতন"
    ],


    Business: [
        "business",

        "client payment",
        "customer payment",

        "invoice",

        "sales",
        "sale",

        "commission",

        "client",
        "customer"
    ]

};


// =====================================================
// 4. INCOME AND EXPENSE WORDS
// =====================================================

const incomeWords = [
    "salary",
    "received",
    "receive",
    "earned",
    "earn",
    "income",
    "credited",
    "deposit",
    "deposited",
    "commission",
    "sales income",
    "client payment",
    "customer payment",
    "payment received",
    "refund received",
    "got paid",

    "বেতন",
    "আয়",
    "পেয়েছি",
    "পেলাম"
];


const expenseWords = [
    "spent",
    "spend",
    "paid",
    "pay",
    "bought",
    "buy",
    "purchase",
    "expense",
    "cost",

    "খরচ",
    "কিনেছি",
    "দিয়েছি"
];


// =====================================================
// 5. NUMBER WORD SUPPORT
// =====================================================

const numberWords = {

    zero: 0,

    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,

    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,

    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90
};


// =====================================================
// 6. NORMALISE BANGLA DIGITS
// =====================================================

function normalizeBanglaDigits(text) {

    const bangla =
        "০১২৩৪৫৬৭৮৯";


    return String(text).replace(
        /[০-৯]/g,
        function(digit) {

            return bangla.indexOf(
                digit
            );

        }
    );
}


// =====================================================
// 7. CONVERT ENGLISH NUMBER WORDS
// =====================================================

function convertNumberWords(text) {

    const tokens =
        String(text)
            .toLowerCase()
            .split(/\s+/);


    const output = [];

    let current = 0;
    let total = 0;
    let insideNumber = false;


    function flushNumber() {

        if (!insideNumber) {
            return;
        }


        output.push(
            String(
                total + current
            )
        );


        current = 0;
        total = 0;
        insideNumber = false;
    }


    for (
        let i = 0;
        i < tokens.length;
        i++
    ) {

        let token =
            tokens[i]
                .replace(
                    /^[^\w]+|[^\w]+$/g,
                    ""
                );


        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    numberWords,
                    token
                )
        ) {

            current +=
                numberWords[token];

            insideNumber =
                true;

            continue;
        }


        if (
            token === "hundred"
        ) {

            if (
                current === 0
            ) {

                current = 1;
            }


            current *= 100;

            insideNumber =
                true;

            continue;
        }


        if (
            token === "thousand"
        ) {

            if (
                current === 0
            ) {

                current = 1;
            }


            total +=
                current * 1000;

            current = 0;

            insideNumber =
                true;

            continue;
        }


        if (
            token === "lakh"
            ||
            token === "lac"
        ) {

            if (
                current === 0
            ) {

                current = 1;
            }


            total +=
                current * 100000;

            current = 0;

            insideNumber =
                true;

            continue;
        }


        if (
            token === "and"
            &&
            insideNumber
        ) {

            continue;
        }


        flushNumber();


        output.push(
            tokens[i]
        );

    }


    flushNumber();


    return output.join(" ");
}


// =====================================================
// 8. NORMALISE SPEECH
// =====================================================

function normalizeText(text) {

    let value =
        normalizeBanglaDigits(
            text
        );


    value =
        convertNumberWords(
            value
        );


    // Remove commas inside numbers:
    // 50,000 -> 50000

    value =
        value.replace(
            /(\d),(?=\d)/g,
            "$1"
        );


    value =
        value
            .toLowerCase()
            .replace(
                /[!?;:]/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    return value;
}


// =====================================================
// 9. FORMAT MONEY
// =====================================================

function formatMoney(amount) {

    return (
        "৳"
        +
        Number(amount)
            .toLocaleString(
                "en-BD",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
    );
}


// =====================================================
// 10. TODAY DATE
// =====================================================

function getToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year
        +
        "-"
        +
        month
        +
        "-"
        +
        day
    );
}


// =====================================================
// 11. YESTERDAY
// =====================================================

function getYesterday() {

    const date =
        new Date();


    date.setDate(
        date.getDate() - 1
    );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year
        +
        "-"
        +
        month
        +
        "-"
        +
        day
    );
}


// =====================================================
// 12. FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const pieces =
        dateValue.split("-");


    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    return (
        pieces[2]
        +
        " "
        +
        months[
            Number(pieces[1]) - 1
        ]
        +
        " "
        +
        pieces[0]
    );
}


// =====================================================
// 13. DETECT DATE
// =====================================================

function detectDate(text) {

    if (
        text.includes("yesterday")
        ||
        text.includes("গতকাল")
    ) {

        return getYesterday();
    }


    return getToday();
}


// =====================================================
// 14. DETECT ACCOUNT
// =====================================================

function detectAccount(text) {

    if (
        text.includes("bkash")
        ||
        text.includes("b-kash")
        ||
        text.includes("nagad")
        ||
        text.includes("rocket")
        ||
        text.includes("wallet")
        ||
        text.includes("বিকাশ")
        ||
        text.includes("নগদ")
    ) {

        return "Mobile Wallet";
    }


    if (
        text.includes("bank")
        ||
        text.includes("card")
        ||
        text.includes("ব্যাংক")
    ) {

        return "Bank";
    }


    return "Cash";
}


// =====================================================
// 15. DETECT TYPE
// =====================================================

function detectExplicitType(text) {

    for (
        const word
        of
        incomeWords
    ) {

        if (
            text.includes(word)
        ) {

            return "Income";
        }

    }


    for (
        const word
        of
        expenseWords
    ) {

        if (
            text.includes(word)
        ) {

            return "Expense";
        }

    }


    return null;
}


// =====================================================
// 16. BUILD LEXICON
// =====================================================

function buildItemLexicon() {

    const lexicon = {};


    for (
        const category
        in
        categoryDictionary
    ) {

        categoryDictionary[
            category
        ]
            .forEach(
                function(item) {

                    lexicon[
                        item.toLowerCase()
                    ] =
                        category;

                }
            );

    }


    for (
        const item
        in
        learnedCategories
    ) {

        lexicon[
            item.toLowerCase()
        ] =
            learnedCategories[
                item
            ];

    }


    return lexicon;
}


// =====================================================
// 17. FIND KNOWN ITEM MARKERS
// =====================================================

function findMarkers(text) {

    const lexicon =
        buildItemLexicon();


    const markers = [];


    const items =
        Object.keys(
            lexicon
        )
            .sort(
                function(a, b) {

                    return (
                        b.length
                        -
                        a.length
                    );

                }
            );


    items.forEach(
        function(item) {

            let startIndex = 0;


            while (true) {

                const index =
                    text.indexOf(
                        item,
                        startIndex
                    );


                if (
                    index === -1
                ) {

                    break;
                }


                const before =
                    index === 0
                        ? " "
                        : text[
                            index - 1
                        ];


                const afterIndex =
                    index
                    +
                    item.length;


                const after =
                    afterIndex >=
                    text.length
                        ? " "
                        : text[
                            afterIndex
                        ];


                const validBefore =
                    /\s|,|\./
                        .test(before);


                const validAfter =
                    /\s|,|\./
                        .test(after);


                if (
                    validBefore
                    &&
                    validAfter
                ) {

                    markers.push({

                        id:
                            item
                            +
                            "-"
                            +
                            index,

                        item:
                            item,

                        category:
                            lexicon[
                                item
                            ],

                        start:
                            index,

                        end:
                            index
                            +
                            item.length

                    });

                }


                startIndex =
                    index
                    +
                    item.length;

            }

        }
    );


    return markers;
}


// =====================================================
// 18. CLEAN DESCRIPTION
// =====================================================

function cleanDescription(text) {

    let value =
        normalizeText(
            text
        );


    value =
        value.replace(
            /\b(spent|spend|paid|pay|bought|buy|purchase|received|receive|earned|earn|income|expense|credited|deposit|deposited)\b/g,
            " "
        );


    value =
        value.replace(
            /\b(on|for|from|with|using|today|yesterday|taka|tk|bdt|and|then)\b/g,
            " "
        );


    value =
        value.replace(
            /\d+(?:\.\d+)?/g,
            " "
        );


    value =
        value.replace(
            /[,.\-]/g,
            " "
        );


    value =
        value.replace(
            /\s+/g,
            " "
        );


    value =
        value.trim();


    if (!value) {
        return "";
    }


    const words =
        value.split(" ");


    return words
        .slice(
            Math.max(
                0,
                words.length - 3
            )
        )
        .join(" ");
}


// =====================================================
// 19. TITLE CASE
// =====================================================

function titleCase(text) {

    return String(text)
        .split(" ")
        .map(
            function(word) {

                if (!word) {
                    return "";
                }


                return (
                    word.charAt(0)
                        .toUpperCase()
                    +
                    word.slice(1)
                );

            }
        )
        .join(" ");
}


// =====================================================
// 20. CATEGORY FOR DESCRIPTION
// =====================================================

function detectCategory(description) {

    const cleaned =
        normalizeText(
            description
        );


    if (
        learnedCategories[
            cleaned
        ]
    ) {

        return learnedCategories[
            cleaned
        ];
    }


    for (
        const category
        in
        categoryDictionary
    ) {

        for (
            const keyword
            of
            categoryDictionary[
                category
            ]
        ) {

            if (
                cleaned.includes(
                    keyword
                        .toLowerCase()
                )
            ) {

                return category;
            }

        }

    }


    return "Other";
}


// =====================================================
// 21. FIND BEST UNUSED MARKER
// =====================================================

function findClosestMarker(
    markers,
    amountStart,
    amountEnd,
    usedMarkers
) {

    let best = null;
    let bestDistance =
        Infinity;


    markers.forEach(
        function(marker) {

            if (
                usedMarkers.has(
                    marker.id
                )
            ) {

                return;
            }


            let distance;


            if (
                marker.end <=
                amountStart
            ) {

                distance =
                    amountStart
                    -
                    marker.end;

            }

            else if (
                marker.start >=
                amountEnd
            ) {

                distance =
                    marker.start
                    -
                    amountEnd;

            }

            else {

                distance = 0;
            }


            if (
                distance <
                bestDistance
            ) {

                best =
                    marker;

                bestDistance =
                    distance;
            }

        }
    );


    if (
        bestDistance > 40
    ) {

        return null;
    }


    return best;
}


// =====================================================
// 22. PARSE VOICE TEXT
// =====================================================

function parseTransactions(
    originalText
) {

    const text =
        normalizeText(
            originalText
        );


    const amountMatches =
        [
            ...text.matchAll(
                /\d+(?:\.\d+)?/g
            )
        ];


    if (
        amountMatches.length ===
        0
    ) {

        return {
            transactions: [],
            remainder:
                originalText
        };
    }


    const markers =
        findMarkers(
            text
        );


    const usedMarkers =
        new Set();


    const results = [];


    let previousType =
        "Expense";


    let lastDescription =
        "";


    let lastUsedSuffix =
        false;


    for (
        let i = 0;
        i <
        amountMatches.length;
        i++
    ) {

        const match =
            amountMatches[i];


        const amount =
            Number(
                match[0]
            );


        if (
            !Number.isFinite(amount)
            ||
            amount <= 0
        ) {

            continue;
        }


        const amountStart =
            match.index;


        const amountEnd =
            match.index
            +
            match[0].length;


        const previousEnd =
            i === 0
                ? 0
                : amountMatches[
                    i - 1
                ].index
                +
                amountMatches[
                    i - 1
                ][0].length;


        const nextStart =
            i ===
            amountMatches.length - 1
                ? text.length
                : amountMatches[
                    i + 1
                ].index;


        const beforeText =
            text.slice(
                previousEnd,
                amountStart
            );


        const afterText =
            text.slice(
                amountEnd,
                nextStart
            );


        let description =
            "";

        let category =
            "Other";

        let selectedMarker =
            null;

        let descriptionFromAfter =
            false;


        // ---------------------------------
        // Try known item directly before
        // ---------------------------------

        const markersBefore =
            markers
                .filter(
                    function(marker) {

                        return (
                            !usedMarkers.has(
                                marker.id
                            )
                            &&
                            marker.start >=
                                previousEnd
                            &&
                            marker.end <=
                                amountStart
                        );

                    }
                )
                .sort(
                    function(a, b) {

                        return (
                            b.end -
                            a.end
                        );

                    }
                );


        if (
            markersBefore.length >
            0
        ) {

            selectedMarker =
                markersBefore[0];

        }


        // ---------------------------------
        // First transaction unknown item:
        // "coriander 80"
        // ---------------------------------

        if (
            !selectedMarker
            &&
            i === 0
        ) {

            const fallbackBefore =
                cleanDescription(
                    beforeText
                );


            if (
                fallbackBefore
            ) {

                description =
                    fallbackBefore;

                category =
                    detectCategory(
                        description
                    );

            }

        }


        // ---------------------------------
        // Try nearest known item
        // ---------------------------------

        if (
            !selectedMarker
            &&
            !description
        ) {

            selectedMarker =
                findClosestMarker(
                    markers,
                    amountStart,
                    amountEnd,
                    usedMarkers
                );

        }


        if (
            selectedMarker
        ) {

            description =
                selectedMarker.item;

            category =
                selectedMarker.category;


            usedMarkers.add(
                selectedMarker.id
            );


            if (
                selectedMarker.start >=
                amountEnd
            ) {

                descriptionFromAfter =
                    true;
            }

        }


        // ---------------------------------
        // Unknown description before amount
        // ---------------------------------

        if (
            !description
        ) {

            const fallbackBefore =
                cleanDescription(
                    beforeText
                );


            if (
                fallbackBefore
                &&
                fallbackBefore !==
                    lastDescription
            ) {

                description =
                    fallbackBefore;

                category =
                    detectCategory(
                        description
                    );

            }

        }


        // ---------------------------------
        // Unknown description after amount
        // ---------------------------------

        if (
            !description
        ) {

            const fallbackAfter =
                cleanDescription(
                    afterText
                );


            if (
                fallbackAfter
            ) {

                description =
                    fallbackAfter;

                category =
                    detectCategory(
                        description
                    );

                descriptionFromAfter =
                    true;

            }

        }


        // No usable item found yet

        if (
            !description
        ) {

            continue;
        }


        // ---------------------------------
        // TYPE
        // ---------------------------------

        let explicitType =
            detectExplicitType(
                beforeText
            );


        if (
            !explicitType
        ) {

            explicitType =
                detectExplicitType(
                    description
                );

        }


        let type =
            explicitType
            ||
            previousType;


        if (
            category ===
            "Salary"
        ) {

            type =
                "Income";
        }


        if (
            description.includes(
                "client payment"
            )
            ||
            description.includes(
                "customer payment"
            )
        ) {

            type =
                "Income";
        }


        previousType =
            type;


        // ---------------------------------
        // ACCOUNT
        // ---------------------------------

        const account =
            detectAccount(
                beforeText
                +
                " "
                +
                afterText
            );


        // ---------------------------------
        // DATE
        // ---------------------------------

        const date =
            detectDate(
                beforeText
                +
                " "
                +
                afterText
            );


        results.push({

            id:
                Date.now()
                +
                i
                +
                Math.floor(
                    Math.random()
                    *
                    1000
                ),

            description:
                titleCase(
                    description
                ),

            amount:
                amount,

            category:
                category,

            type:
                type,

            account:
                account,

            date:
                date,

            createdAt:
                Date.now()

        });


        lastDescription =
            description;


        if (
            i ===
            amountMatches.length - 1
        ) {

            lastUsedSuffix =
                descriptionFromAfter;
        }

    }


    // ---------------------------------
    // KEEP INCOMPLETE LAST PHRASE
    // Example:
    // "chal 500 dal"
    // saves chal, retains "dal"
    // ---------------------------------

    let remainder =
        "";


    const lastMatch =
        amountMatches[
            amountMatches.length - 1
        ];


    const trailingText =
        text.slice(
            lastMatch.index
            +
            lastMatch[0].length
        );


    const cleanedTrailing =
        cleanDescription(
            trailingText
        );


    if (
        cleanedTrailing
        &&
        !lastUsedSuffix
    ) {

        remainder =
            cleanedTrailing;
    }


    return {
        transactions:
            results,

        remainder:
            remainder
    };
}


// =====================================================
// 23. ADD PARSED TRANSACTIONS
// =====================================================

function addParsedTransactions(
    text,
    fromVoice = false
) {

    const cleanedInput =
        String(text)
            .trim();


    if (!cleanedInput) {

        return {
            added: 0,
            remainder: ""
        };
    }


    // Prevent accidental duplicate transcript

    const now =
        Date.now();


    if (
        cleanedInput ===
            lastProcessedText
        &&
        now -
            lastProcessedTime <
            2000
    ) {

        return {
            added: 0,
            remainder: ""
        };
    }


    const parsed =
        parseTransactions(
            cleanedInput
        );


    if (
        parsed.transactions.length ===
        0
    ) {

        if (
            fromVoice
        ) {

            voiceMessage.textContent =
                "Waiting for an amount or item...";
        }


        return {
            added: 0,
            remainder:
                parsed.remainder
                ||
                cleanedInput
        };
    }


    parsed.transactions
        .forEach(
            function(transaction) {

                transactions.push(
                    transaction
                );

            }
        );


    lastProcessedText =
        cleanedInput;


    lastProcessedTime =
        now;


    saveData();

    refreshApp();


    const batchIncome =
        parsed.transactions
            .filter(
                function(item) {

                    return (
                        item.type ===
                        "Income"
                    );

                }
            )
            .reduce(
                function(total, item) {

                    return (
                        total
                        +
                        item.amount
                    );

                },
                0
            );


    const batchExpense =
        parsed.transactions
            .filter(
                function(item) {

                    return (
                        item.type ===
                        "Expense"
                    );

                }
            )
            .reduce(
                function(total, item) {

                    return (
                        total
                        +
                        item.amount
                    );

                },
                0
            );


    voiceMessage.textContent =
        parsed.transactions.length
        +
        " transaction"
        +
        (
            parsed.transactions.length ===
            1
                ? ""
                : "s"
        )
        +
        " added. Income "
        +
        formatMoney(
            batchIncome
        )
        +
        ", expense "
        +
        formatMoney(
            batchExpense
        )
        +
        ".";


    return {
        added:
            parsed.transactions.length,

        remainder:
            parsed.remainder
    };
}


// =====================================================
// 24. PROCESS SPEECH BUFFER
// =====================================================

function processSpeechBuffer() {

    clearTimeout(
        processingTimer
    );


    processingTimer =
        null;


    const text =
        speechBuffer.trim();


    if (!text) {
        return;
    }


    const result =
        addParsedTransactions(
            text,
            true
        );


    if (
        result.added >
        0
    ) {

        speechBuffer =
            result.remainder
            ||
            "";

    }


    updatePendingDisplay();


    if (
        speechBuffer
    ) {

        setStatus(
            "waiting",
            "Waiting for amount..."
        );

    }

    else if (
        keepListening
    ) {

        setStatus(
            "listening",
            "Listening"
        );
    }

}


// =====================================================
// 25. SCHEDULE BUFFER PROCESSING
// =====================================================

function scheduleBufferProcessing() {

    clearTimeout(
        processingTimer
    );


    processingTimer =
        setTimeout(
            processSpeechBuffer,
            PROCESS_DELAY
        );
}


// =====================================================
// 26. UPDATE PENDING DISPLAY
// =====================================================

function updatePendingDisplay() {

    pendingBuffer.textContent =
        speechBuffer.trim()
        ||
        "—";
}


// =====================================================
// 27. TRANSCRIPT HISTORY
// =====================================================

function addTranscript(text) {

    const value =
        String(text)
            .trim();


    if (!value) {
        return;
    }


    transcriptHistory.push(
        value
    );


    if (
        transcriptHistory.length >
        8
    ) {

        transcriptHistory.shift();
    }


    liveTranscript.textContent =
        transcriptHistory.join(
            "  •  "
        );
}


// =====================================================
// 28. STATUS
// =====================================================

function setStatus(
    state,
    text
) {

    listenStatus.className =
        "listen-status "
        +
        state;


    const statusText =
        listenStatus
            .querySelector(
                ".status-text"
            );


    statusText.textContent =
        text;
}


// =====================================================
// 29. SPEECH RECOGNITION SETUP
// =====================================================

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition
        ||
        window.webkitSpeechRecognition;


    if (
        !SpeechRecognition
    ) {

        startButton.disabled =
            true;


        setStatus(
            "error",
            "Not supported"
        );


        voiceMessage.textContent =
            "Speech recognition is not supported in this browser. Use Google Chrome or type transactions in the test box.";

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        true;


    recognition.interimResults =
        true;


    recognition.maxAlternatives =
        1;


    recognition.onstart =
        function() {

            recognitionRunning =
                true;


            setStatus(
                "listening",
                "Listening"
            );


            startButton.disabled =
                true;


            stopButton.disabled =
                false;

        };


    recognition.onresult =
        function(event) {

            let interimText =
                "";


            for (
                let i =
                    event.resultIndex;
                i <
                    event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0]
                        .transcript
                        .trim();


                if (
                    event.results[i]
                        .isFinal
                ) {

                    if (
                        transcript
                    ) {

                        addTranscript(
                            transcript
                        );


                        speechBuffer +=
                            (
                                speechBuffer
                                ? " "
                                : ""
                            )
                            +
                            transcript;


                        updatePendingDisplay();


                        scheduleBufferProcessing();

                    }

                }

                else {

                    interimText +=
                        transcript
                        +
                        " ";

                }

            }


            if (
                interimText.trim()
            ) {

                setStatus(
                    "listening",
                    "Listening..."
                );
            }

        };


    recognition.onerror =
        function(event) {

            if (
                event.error ===
                "no-speech"
            ) {

                // Do not stop.
                // Wait and restart.

                setStatus(
                    "waiting",
                    "Waiting..."
                );

                return;
            }


            if (
                event.error ===
                "aborted"
            ) {

                return;
            }


            if (
                event.error ===
                "not-allowed"
                ||
                event.error ===
                "service-not-allowed"
            ) {

                keepListening =
                    false;


                setStatus(
                    "error",
                    "Microphone blocked"
                );


                voiceMessage.textContent =
                    "Allow microphone permission in Chrome and macOS settings.";

                return;
            }


            if (
                event.error ===
                "network"
            ) {

                keepListening =
                    false;


                setStatus(
                    "error",
                    "Network error"
                );


                voiceMessage.textContent =
                    "Speech recognition lost its connection. Check your internet and use Google Chrome.";

                return;
            }


            setStatus(
                "error",
                event.error
            );

        };


    recognition.onend =
        function() {

            recognitionRunning =
                false;


            // IMPORTANT:
            // Chrome may stop after a pause.
            // Automatically start it again.

            if (
                keepListening
            ) {

                setStatus(
                    "waiting",
                    "Waiting..."
                );


                setTimeout(
                    function() {

                        if (
                            keepListening
                            &&
                            !recognitionRunning
                        ) {

                            startRecognitionSession();

                        }

                    },
                    350
                );

            }

            else {

                setStatus(
                    "stopped",
                    "Stopped"
                );


                startButton.disabled =
                    false;


                stopButton.disabled =
                    true;
            }

        };
}


// =====================================================
// 30. START ONE RECOGNITION SESSION
// =====================================================

function startRecognitionSession() {

    if (
        !recognition
        ||
        recognitionRunning
        ||
        !keepListening
    ) {

        return;
    }


    recognition.lang =
        languageSelect.value;


    try {

        recognition.start();

    }

    catch (error) {

        setTimeout(
            function() {

                if (
                    keepListening
                ) {

                    startRecognitionSession();

                }

            },
            500
        );

    }
}


// =====================================================
// 31. START CONTINUOUS LISTENING
// =====================================================

function startListening() {

    if (
        !recognition
    ) {

        return;
    }


    keepListening =
        true;


    voiceMessage.textContent =
        "Listening continuously. Pause whenever you want. Press Stop when finished.";


    startRecognitionSession();
}


// =====================================================
// 32. STOP LISTENING
// =====================================================

function stopListening() {

    keepListening =
        false;


    clearTimeout(
        processingTimer
    );


    processingTimer =
        null;


    // Process anything still waiting

    if (
        speechBuffer.trim()
    ) {

        processSpeechBuffer();
    }


    if (
        recognition
        &&
        recognitionRunning
    ) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.log(
                error
            );

        }

    }


    startButton.disabled =
        false;


    stopButton.disabled =
        true;


    setStatus(
        "stopped",
        "Stopped"
    );
}


// =====================================================
// 33. DASHBOARD
// =====================================================

function updateDashboard() {

    let income = 0;

    let expense = 0;


    transactions.forEach(
        function(transaction) {

            if (
                transaction.type ===
                "Income"
            ) {

                income +=
                    Number(
                        transaction.amount
                    );

            }

            else {

                expense +=
                    Number(
                        transaction.amount
                    );

            }

        }
    );


    const balance =
        income -
        expense;


    incomeTotal.textContent =
        formatMoney(
            income
        );


    expenseTotal.textContent =
        formatMoney(
            expense
        );


    balanceTotal.textContent =
        formatMoney(
            balance
        );


    transactionCount.textContent =
        transactions.length;
}


// =====================================================
// 34. FILTER TRANSACTIONS
// =====================================================

function getFilteredTransactions() {

    const search =
        filterSearch
            .value
            .trim()
            .toLowerCase();


    const type =
        filterType.value;


    const category =
        filterCategory.value;


    const month =
        filterMonth.value;


    return transactions.filter(
        function(transaction) {

            const searchText =
                (
                    transaction.description
                    +
                    " "
                    +
                    transaction.category
                    +
                    " "
                    +
                    transaction.account
                )
                    .toLowerCase();


            const matchesSearch =
                searchText.includes(
                    search
                );


            const matchesType =
                type ===
                "All"
                ||
                transaction.type ===
                type;


            const matchesCategory =
                category ===
                "All"
                ||
                transaction.category ===
                category;


            const matchesMonth =
                !month
                ||
                transaction.date
                    .startsWith(
                        month
                    );


            return (
                matchesSearch
                &&
                matchesType
                &&
                matchesCategory
                &&
                matchesMonth
            );

        }
    );
}


// =====================================================
// 35. DISPLAY TRANSACTIONS
// =====================================================

function displayTransactions() {

    transactionList.innerHTML =
        "";


    const data =
        getFilteredTransactions()
            .sort(
                function(a, b) {

                    return (
                        b.createdAt
                        -
                        a.createdAt
                    );

                }
            );


    if (
        data.length ===
        0
    ) {

        transactionList.innerHTML =
            `
            <div class="empty-state">
                No transactions found.
            </div>
            `;

        return;
    }


    data.forEach(
        function(transaction) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "transaction-item";


            const info =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "transaction-name";


            name.textContent =
                transaction.description;


            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "transaction-meta";


            const categoryBadge =
                document.createElement(
                    "span"
                );


            categoryBadge.className =
                "transaction-category";


            categoryBadge.textContent =
                transaction.category;


            const metaText =
                document.createElement(
                    "span"
                );


            metaText.textContent =
                transaction.account
                +
                " • "
                +
                formatDate(
                    transaction.date
                );


            meta.appendChild(
                categoryBadge
            );


            meta.appendChild(
                metaText
            );


            info.appendChild(
                name
            );


            info.appendChild(
                meta
            );


            const amount =
                document.createElement(
                    "div"
                );


            amount.className =
                "transaction-amount";


            if (
                transaction.type ===
                "Income"
            ) {

                amount.classList.add(
                    "income-amount"
                );


                amount.textContent =
                    "+"
                    +
                    formatMoney(
                        transaction.amount
                    );

            }

            else {

                amount.classList.add(
                    "expense-amount"
                );


                amount.textContent =
                    "-"
                    +
                    formatMoney(
                        transaction.amount
                    );

            }


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "transaction-actions";


            const teachButton =
                document.createElement(
                    "button"
                );


            teachButton.className =
                "teach-button";


            teachButton.textContent =
                "Teach";


            teachButton.addEventListener(
                "click",
                function() {

                    teachCategory(
                        transaction.id
                    );

                }
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-button";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                function() {

                    deleteTransaction(
                        transaction.id
                    );

                }
            );


            actions.appendChild(
                teachButton
            );


            actions.appendChild(
                deleteButton
            );


            row.appendChild(
                info
            );


            row.appendChild(
                amount
            );


            row.appendChild(
                actions
            );


            transactionList.appendChild(
                row
            );

        }
    );
}


// =====================================================
// 36. DELETE TRANSACTION
// =====================================================

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            function(transaction) {

                return (
                    transaction.id !==
                    id
                );

            }
        );


    saveData();

    refreshApp();
}


// =====================================================
// 37. UNDO LAST
// =====================================================

function undoLastTransaction() {

    if (
        transactions.length ===
        0
    ) {

        voiceMessage.textContent =
            "There is nothing to undo.";

        return;
    }


    let newest =
        transactions[0];


    transactions.forEach(
        function(transaction) {

            if (
                transaction.createdAt >
                newest.createdAt
            ) {

                newest =
                    transaction;

            }

        }
    );


    transactions =
        transactions.filter(
            function(transaction) {

                return (
                    transaction.id !==
                    newest.id
                );

            }
        );


    saveData();

    refreshApp();


    voiceMessage.textContent =
        "Removed: "
        +
        newest.description
        +
        " "
        +
        formatMoney(
            newest.amount
        );
}


// =====================================================
// 38. TEACH CATEGORY
// =====================================================

function teachCategory(id) {

    const transaction =
        transactions.find(
            function(item) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (
        !transaction
    ) {

        return;
    }


    const allowed =
        [
            "Food",
            "Travel",
            "Bills",
            "Shopping",
            "Rent",
            "Health",
            "Education",
            "Entertainment",
            "Salary",
            "Business",
            "Other"
        ];


    const answer =
        prompt(
            "Choose category:\n\n"
            +
            allowed.join(", ")
            +
            "\n\nCurrent category: "
            +
            transaction.category,
            transaction.category
        );


    if (
        answer === null
    ) {

        return;
    }


    const match =
        allowed.find(
            function(category) {

                return (
                    category.toLowerCase()
                    ===
                    answer
                        .trim()
                        .toLowerCase()
                );

            }
        );


    if (
        !match
    ) {

        alert(
            "Please enter one of the listed categories."
        );

        return;
    }


    transaction.category =
        match;


    if (
        match ===
        "Salary"
    ) {

        transaction.type =
            "Income";
    }


    const learningKey =
        normalizeText(
            transaction.description
        );


    learnedCategories[
        learningKey
    ] =
        match;


    saveData();

    refreshApp();


    voiceMessage.textContent =
        "Learned: "
        +
        transaction.description
        +
        " → "
        +
        match;
}


// =====================================================
// 39. LEARNED COUNT
// =====================================================

function updateLearnedCount() {

    learnedCount.textContent =
        Object.keys(
            learnedCategories
        ).length;
}


// =====================================================
// 40. SAVE DATA
// =====================================================

function saveData() {

    localStorage.setItem(
        "voiceLedgerTransactions",
        JSON.stringify(
            transactions
        )
    );


    localStorage.setItem(
        "voiceLedgerLearnedCategories",
        JSON.stringify(
            learnedCategories
        )
    );
}


// =====================================================
// 41. LOAD DATA
// =====================================================

function loadData() {

    try {

        const savedTransactions =
            localStorage.getItem(
                "voiceLedgerTransactions"
            );


        const savedLearning =
            localStorage.getItem(
                "voiceLedgerLearnedCategories"
            );


        if (
            savedTransactions
        ) {

            transactions =
                JSON.parse(
                    savedTransactions
                );

        }


        if (
            savedLearning
        ) {

            learnedCategories =
                JSON.parse(
                    savedLearning
                );

        }


        if (
            !Array.isArray(
                transactions
            )
        ) {

            transactions =
                [];
        }


        if (
            !learnedCategories
            ||
            typeof learnedCategories !==
                "object"
            ||
            Array.isArray(
                learnedCategories
            )
        ) {

            learnedCategories =
                {};
        }

    }

    catch (error) {

        console.error(
            error
        );


        transactions =
            [];


        learnedCategories =
            {};
    }

}


// =====================================================
// 42. CLEAR ALL
// =====================================================

function clearAllData() {

    const confirmed =
        confirm(
            "This will delete all transactions and learned categories. Continue?"
        );


    if (
        !confirmed
    ) {

        return;
    }


    transactions =
        [];


    learnedCategories =
        {};


    speechBuffer =
        "";


    transcriptHistory =
        [];


    liveTranscript.textContent =
        "Your speech will appear here...";


    updatePendingDisplay();


    saveData();

    refreshApp();


    voiceMessage.textContent =
        "All Voice Ledger data has been cleared.";
}


// =====================================================
// 43. REFRESH APP
// =====================================================

function refreshApp() {

    updateDashboard();

    displayTransactions();

    updateLearnedCount();
}


// =====================================================
// 44. MANUAL PARSER TEST
// =====================================================

function processManualText() {

    const text =
        manualInput
            .value
            .trim();


    if (
        !text
    ) {

        return;
    }


    const result =
        addParsedTransactions(
            text,
            false
        );


    if (
        result.added ===
        0
    ) {

        voiceMessage.textContent =
            "I could not find a complete transaction. Try something like 'chal 500 dal 200'.";

        return;
    }


    manualInput.value =
        "";
}


// =====================================================
// 45. EVENTS
// =====================================================

startButton.addEventListener(
    "click",
    startListening
);


stopButton.addEventListener(
    "click",
    stopListening
);


undoButton.addEventListener(
    "click",
    undoLastTransaction
);


processManualButton.addEventListener(
    "click",
    processManualText
);


manualInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            processManualText();
        }

    }
);


filterSearch.addEventListener(
    "input",
    displayTransactions
);


filterType.addEventListener(
    "change",
    displayTransactions
);


filterCategory.addEventListener(
    "change",
    displayTransactions
);


filterMonth.addEventListener(
    "change",
    displayTransactions
);


clearAllButton.addEventListener(
    "click",
    clearAllData
);


// =====================================================
// 46. START APPLICATION
// =====================================================

loadData();

setupSpeechRecognition();

refreshApp();

updatePendingDisplay();