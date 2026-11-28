/* ==========================================================
   Fauna AI Quest — Master Dataset (25 Hewan, 75 Foto)
   Foto 1 & 2: sampleImages (contoh berlabel siswa)
   Foto 3:     testImage (gambar uji, tidak ditampilkan saat melatih)
   ========================================================== */
(function () {
  'use strict';

  var CLASSES = [
    {
      id: 'mamalia',
      name: 'Mamalia',
      img: 'assets/images/animals/Mamalia/panda/Panda-1.jpg',
      desc: 'Hewan bertulang belakang yang umumnya berambut dan menyusui anaknya.',
      ex: 'Contoh: Cheetah, Koala, Panda, Lumba-lumba, Paus'
    },
    {
      id: 'aves',
      name: 'Aves',
      img: 'assets/images/animals/Aves/eagle/eagle-1.jpg',
      desc: 'Hewan bertulang belakang yang memiliki bulu unggas, paruh, dan sayap.',
      ex: 'Contoh: Elang, Flamingo, Rangkong, Burung hantu, Penguin'
    },
    {
      id: 'reptil',
      name: 'Reptil',
      img: 'assets/images/animals/Reptil/iguana/iguana-2.jpg',
      desc: 'Hewan bertulang belakang yang umumnya memiliki kulit bersisik atau cangkang keras.',
      ex: 'Contoh: Buaya, Iguana, Kadal, Ular, Penyu'
    },
    {
      id: 'amfibi',
      name: 'Amfibi',
      img: 'assets/images/animals/Amfibi/Frog/frog2.jpg',
      desc: 'Hewan bertulang belakang berkulit terbuka yang umumnya hidup di dua alam.',
      ex: 'Contoh: Axolotl, Kadal air, Salamander, Kodok, Katak'
    },
    {
      id: 'pisces',
      name: 'Pisces',
      img: 'assets/images/animals/pisces/Shark/shark2.jpg',
      desc: 'Hewan bertulang belakang yang hidup di air dan umumnya memiliki sirip.',
      ex: 'Contoh: Ikan pari, Belut, Ikan buntal, Kuda laut, Hiu'
    }
  ];

  var ANIMALS = [
    // ---------- Amfibi ----------
    {
      animalId: 'axolotl',
      displayName: 'Axolotl',
      classId: 'amfibi',
      sampleImages: [
        { id: 'axolotl-1', order: 1, src: 'assets/images/animals/Amfibi/Axolotl/axolotl1.jpg' },
        { id: 'axolotl-2', order: 2, src: 'assets/images/animals/Amfibi/Axolotl/axolotl2.jpg' }
      ],
      testImage: { id: 'axolotl-3', order: 3, src: 'assets/images/animals/Amfibi/Axolotl/axolotl3.jpg' }
    },
    {
      animalId: 'kadal-air',
      displayName: 'Kadal Air',
      classId: 'amfibi',
      sampleImages: [
        { id: 'kadal-air-1', order: 1, src: 'assets/images/animals/Amfibi/Kadal-air/kadal-air1.jpg' },
        { id: 'kadal-air-2', order: 2, src: 'assets/images/animals/Amfibi/Kadal-air/kadal-air2.jpg' }
      ],
      testImage: { id: 'kadal-air-3', order: 3, src: 'assets/images/animals/Amfibi/Kadal-air/kadal-air3.jpg' }
    },
    {
      animalId: 'salamander',
      displayName: 'Salamander',
      classId: 'amfibi',
      sampleImages: [
        { id: 'salamander-1', order: 1, src: 'assets/images/animals/Amfibi/Salamander/salamander1.jpg' },
        { id: 'salamander-2', order: 2, src: 'assets/images/animals/Amfibi/Salamander/salamander2.jpg' }
      ],
      testImage: { id: 'salamander-3', order: 3, src: 'assets/images/animals/Amfibi/Salamander/salamander3.jpg' }
    },
    {
      animalId: 'kodok',
      displayName: 'Kodok',
      classId: 'amfibi',
      sampleImages: [
        { id: 'kodok-1', order: 1, src: 'assets/images/animals/Amfibi/Toad/toad1.jpg' },
        { id: 'kodok-2', order: 2, src: 'assets/images/animals/Amfibi/Toad/toad2.jpg' }
      ],
      testImage: { id: 'kodok-3', order: 3, src: 'assets/images/animals/Amfibi/Toad/toad3.jpg' }
    },
    {
      animalId: 'katak',
      displayName: 'Katak',
      classId: 'amfibi',
      sampleImages: [
        { id: 'katak-1', order: 1, src: 'assets/images/animals/Amfibi/Frog/frog1.jpg' },
        { id: 'katak-2', order: 2, src: 'assets/images/animals/Amfibi/Frog/frog2.jpg' }
      ],
      testImage: { id: 'katak-3', order: 3, src: 'assets/images/animals/Amfibi/Frog/frog3.jpg' }
    },

    // ---------- Aves ----------
    {
      animalId: 'elang',
      displayName: 'Elang',
      classId: 'aves',
      sampleImages: [
        { id: 'elang-1', order: 1, src: 'assets/images/animals/Aves/eagle/eagle-1.jpg' },
        { id: 'elang-2', order: 2, src: 'assets/images/animals/Aves/eagle/eagle-2.jpg' }
      ],
      testImage: { id: 'elang-3', order: 3, src: 'assets/images/animals/Aves/eagle/eagle-3.jpg' }
    },
    {
      animalId: 'flamingo',
      displayName: 'Flamingo',
      classId: 'aves',
      sampleImages: [
        { id: 'flamingo-1', order: 1, src: 'assets/images/animals/Aves/flamingo/flamingo-1.jpg' },
        { id: 'flamingo-2', order: 2, src: 'assets/images/animals/Aves/flamingo/flamingo-2.jpg' }
      ],
      testImage: { id: 'flamingo-3', order: 3, src: 'assets/images/animals/Aves/flamingo/flamingo-3.jpg' }
    },
    {
      animalId: 'rangkong',
      displayName: 'Rangkong',
      classId: 'aves',
      sampleImages: [
        { id: 'rangkong-1', order: 1, src: 'assets/images/animals/Aves/hornbill/hornbill-1.jpg' },
        { id: 'rangkong-2', order: 2, src: 'assets/images/animals/Aves/hornbill/hornbill-2.jpg' }
      ],
      testImage: { id: 'rangkong-3', order: 3, src: 'assets/images/animals/Aves/hornbill/hornbill-3.jpg' }
    },
    {
      animalId: 'burung-hantu',
      displayName: 'Burung Hantu',
      classId: 'aves',
      sampleImages: [
        { id: 'burung-hantu-1', order: 1, src: 'assets/images/animals/Aves/owl/owl-1.jpg' },
        { id: 'burung-hantu-2', order: 2, src: 'assets/images/animals/Aves/owl/owl-2.jpg' }
      ],
      testImage: { id: 'burung-hantu-3', order: 3, src: 'assets/images/animals/Aves/owl/owl-3.jpg' }
    },
    {
      animalId: 'penguin',
      displayName: 'Penguin',
      classId: 'aves',
      sampleImages: [
        { id: 'penguin-1', order: 1, src: 'assets/images/animals/Aves/penguin/penguin-1.jpg' },
        { id: 'penguin-2', order: 2, src: 'assets/images/animals/Aves/penguin/penguin-2.jpg' }
      ],
      testImage: { id: 'penguin-3', order: 3, src: 'assets/images/animals/Aves/penguin/penguin-3.jpg' }
    },

    // ---------- Mamalia ----------
    {
      animalId: 'cheetah',
      displayName: 'Cheetah',
      classId: 'mamalia',
      sampleImages: [
        { id: 'cheetah-1', order: 1, src: 'assets/images/animals/Mamalia/cheetah/cheetah-1.jpg' },
        { id: 'cheetah-2', order: 2, src: 'assets/images/animals/Mamalia/cheetah/cheetah-2.jpg' }
      ],
      testImage: { id: 'cheetah-3', order: 3, src: 'assets/images/animals/Mamalia/cheetah/cheetah-3.jpg' }
    },
    {
      animalId: 'lumba-lumba',
      displayName: 'Lumba-lumba',
      classId: 'mamalia',
      sampleImages: [
        { id: 'lumba-lumba-1', order: 1, src: 'assets/images/animals/Mamalia/dolphin/lumba-lumba-1.jpg' },
        { id: 'lumba-lumba-2', order: 2, src: 'assets/images/animals/Mamalia/dolphin/lumba-lumba-2.jpg' }
      ],
      testImage: { id: 'lumba-lumba-3', order: 3, src: 'assets/images/animals/Mamalia/dolphin/lumba-lumba-3.jpg' }
    },
    {
      animalId: 'koala',
      displayName: 'Koala',
      classId: 'mamalia',
      sampleImages: [
        { id: 'koala-1', order: 1, src: 'assets/images/animals/Mamalia/koala/Koala-1.jpg' },
        { id: 'koala-2', order: 2, src: 'assets/images/animals/Mamalia/koala/Koala-2.jpg' }
      ],
      testImage: { id: 'koala-3', order: 3, src: 'assets/images/animals/Mamalia/koala/Koala-3.jpg' }
    },
    {
      animalId: 'panda',
      displayName: 'Panda',
      classId: 'mamalia',
      sampleImages: [
        { id: 'panda-1', order: 1, src: 'assets/images/animals/Mamalia/panda/Panda-1.jpg' },
        { id: 'panda-2', order: 2, src: 'assets/images/animals/Mamalia/panda/Panda-2.jpg' }
      ],
      testImage: { id: 'panda-3', order: 3, src: 'assets/images/animals/Mamalia/panda/Panda-3.jpg' }
    },
    {
      animalId: 'paus',
      displayName: 'Paus',
      classId: 'mamalia',
      sampleImages: [
        { id: 'paus-1', order: 1, src: 'assets/images/animals/Mamalia/whale/Whale-1.jpg' },
        { id: 'paus-2', order: 2, src: 'assets/images/animals/Mamalia/whale/Whale-2.jpg' }
      ],
      testImage: { id: 'paus-3', order: 3, src: 'assets/images/animals/Mamalia/whale/Whale-3.jpg' }
    },

    // ---------- Pisces ----------
    {
      animalId: 'ikan-pari',
      displayName: 'Ikan Pari',
      classId: 'pisces',
      sampleImages: [
        { id: 'ikan-pari-1', order: 1, src: 'assets/images/animals/pisces/ikan-pari/ikan-pari1.jpg' },
        { id: 'ikan-pari-2', order: 2, src: 'assets/images/animals/pisces/ikan-pari/ikan-pari2.jpg' }
      ],
      testImage: { id: 'ikan-pari-3', order: 3, src: 'assets/images/animals/pisces/ikan-pari/ikan-pari3.jpg' }
    },
    {
      animalId: 'belut',
      displayName: 'Belut',
      classId: 'pisces',
      sampleImages: [
        { id: 'belut-1', order: 1, src: 'assets/images/animals/pisces/Eel/belut1.jpg' },
        { id: 'belut-2', order: 2, src: 'assets/images/animals/pisces/Eel/belut2.jpg' }
      ],
      testImage: { id: 'belut-3', order: 3, src: 'assets/images/animals/pisces/Eel/belut3.jpg' }
    },
    {
      animalId: 'ikan-buntal',
      displayName: 'Ikan Buntal',
      classId: 'pisces',
      sampleImages: [
        { id: 'ikan-buntal-1', order: 1, src: 'assets/images/animals/pisces/Puffer/ikan-buntal1.jpg' },
        { id: 'ikan-buntal-2', order: 2, src: 'assets/images/animals/pisces/Puffer/ikan-buntal 2.jpg' }
      ],
      testImage: { id: 'ikan-buntal-3', order: 3, src: 'assets/images/animals/pisces/Puffer/ikan-buntal3.jpg' }
    },
    {
      animalId: 'kuda-laut',
      displayName: 'Kuda Laut',
      classId: 'pisces',
      sampleImages: [
        { id: 'kuda-laut-1', order: 1, src: 'assets/images/animals/pisces/Sea-Horse/seahorse1.jpg' },
        { id: 'kuda-laut-2', order: 2, src: 'assets/images/animals/pisces/Sea-Horse/seahorse2.jpg' }
      ],
      testImage: { id: 'kuda-laut-3', order: 3, src: 'assets/images/animals/pisces/Sea-Horse/seahorse3.jpg' }
    },
    {
      animalId: 'hiu',
      displayName: 'Hiu',
      classId: 'pisces',
      sampleImages: [
        { id: 'hiu-1', order: 1, src: 'assets/images/animals/pisces/Shark/shark1.jpg' },
        { id: 'hiu-2', order: 2, src: 'assets/images/animals/pisces/Shark/shark2.jpg' }
      ],
      testImage: { id: 'hiu-3', order: 3, src: 'assets/images/animals/pisces/Shark/shark3.jpg' }
    },

    // ---------- Reptil ----------
    {
      animalId: 'buaya',
      displayName: 'Buaya',
      classId: 'reptil',
      sampleImages: [
        { id: 'buaya-1', order: 1, src: 'assets/images/animals/Reptil/crocodile/crocodile1.jpg' },
        { id: 'buaya-2', order: 2, src: 'assets/images/animals/Reptil/crocodile/crocodile2.jpg' }
      ],
      testImage: { id: 'buaya-3', order: 3, src: 'assets/images/animals/Reptil/crocodile/crocodile3.jpg' }
    },
    {
      animalId: 'iguana',
      displayName: 'Iguana',
      classId: 'reptil',
      sampleImages: [
        { id: 'iguana-1', order: 1, src: 'assets/images/animals/Reptil/iguana/iguana-1.jpg' },
        { id: 'iguana-2', order: 2, src: 'assets/images/animals/Reptil/iguana/iguana-2.jpg' }
      ],
      testImage: { id: 'iguana-3', order: 3, src: 'assets/images/animals/Reptil/iguana/iguana-3.jpg' }
    },
    {
      animalId: 'kadal',
      displayName: 'Kadal',
      classId: 'reptil',
      sampleImages: [
        { id: 'kadal-1', order: 1, src: 'assets/images/animals/Reptil/lizard/lizard-1.jpg' },
        { id: 'kadal-2', order: 2, src: 'assets/images/animals/Reptil/lizard/lizard-2.jpg' }
      ],
      testImage: { id: 'kadal-3', order: 3, src: 'assets/images/animals/Reptil/lizard/lizard-3.jpg' }
    },
    {
      animalId: 'ular',
      displayName: 'Ular',
      classId: 'reptil',
      sampleImages: [
        { id: 'ular-1', order: 1, src: 'assets/images/animals/Reptil/snake/snake1.jpg' },
        { id: 'ular-2', order: 2, src: 'assets/images/animals/Reptil/snake/snake2.jpg' }
      ],
      testImage: { id: 'ular-3', order: 3, src: 'assets/images/animals/Reptil/snake/snake3.jpg' }
    },
    {
      animalId: 'penyu',
      displayName: 'Penyu',
      classId: 'reptil',
      sampleImages: [
        { id: 'penyu-1', order: 1, src: 'assets/images/animals/Reptil/turtle/turtle1.jpg' },
        { id: 'penyu-2', order: 2, src: 'assets/images/animals/Reptil/turtle/turtle2.jpg' }
      ],
      testImage: { id: 'penyu-3', order: 3, src: 'assets/images/animals/Reptil/turtle/turtle3.png' }
    }
  ];

  // Urutan selang-seling antar kelas agar siswa tidak menebak berdasarkan urutan kelas
  function interleaveAnimals(list) {
    var byClass = {};
    CLASSES.forEach(function (c) { byClass[c.id] = []; });
    list.forEach(function (a) {
      if (byClass[a.classId]) byClass[a.classId].push(a);
    });
    var out = [];
    for (var i = 0; i < 5; i++) {
      CLASSES.forEach(function (c) {
        if (byClass[c.id][i]) out.push(byClass[c.id][i]);
      });
    }
    return out;
  }

  var ORDERED_ANIMALS = interleaveAnimals(ANIMALS);

  function getClassMap() {
    var map = {};
    CLASSES.forEach(function (c) { map[c.id] = c; });
    return map;
  }

  function getFeaturesModule() {
    if (typeof window !== 'undefined' && window.FaunaFeatures) return window.FaunaFeatures;
    if (typeof require === 'function') return require('./features.js');
    return null;
  }

  // Mengembalikan daftar 50 gambar contoh (tanpa mengekspos classId untuk engine prediksi)
  function getSampleImages(includeTrueClass) {
    var FF = getFeaturesModule();
    var list = [];
    // Putaran 1: foto ke-1 dari 25 hewan, Putaran 2: foto ke-2 dari 25 hewan
    [0, 1].forEach(function (idx) {
      ORDERED_ANIMALS.forEach(function (a) {
        var img = a.sampleImages[idx];
        var item = {
          id: img.id,
          animalId: a.animalId,
          displayName: a.displayName,
          order: img.order,
          src: img.src,
          features: (FF && FF.get(img.id)) || null
        };
        if (includeTrueClass) item.classId = a.classId;
        list.push(item);
      });
    });
    return list;
  }

  // Mengembalikan daftar 25 gambar uji (foto ke-3)
  function getTestImages(includeTrueClass) {
    var FF = getFeaturesModule();
    return ORDERED_ANIMALS.map(function (a) {
      var img = a.testImage;
      var item = {
        id: img.id,
        animalId: a.animalId,
        displayName: a.displayName,
        order: img.order,
        src: img.src,
        features: (FF && FF.get(img.id)) || null
      };
      if (includeTrueClass) item.classId = a.classId;
      return item;
    });
  }

  var api = {
    CLASSES: CLASSES,
    ANIMALS: ANIMALS,
    ORDERED_ANIMALS: ORDERED_ANIMALS,
    getClassMap: getClassMap,
    getSampleImages: getSampleImages,
    getTestImages: getTestImages
  };

  if (typeof window !== 'undefined') {
    window.FaunaDataset = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
