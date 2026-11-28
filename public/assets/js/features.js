/* ==========================================================
   Fauna AI Quest — Kamus Fitur Visual (33 Fitur, 4 Kelompok)
   Nilai tiap fitur pada setiap foto:
     1    = karakteristik terlihat jelas
     0    = karakteristik jelas tidak ada & bagian tubuh relevan terlihat
     null = tidak dapat dipastikan (tertutup, terpotong, atau tidak tampak)
   ========================================================== */
(function () {
  'use strict';

  var FEATURE_GROUPS = [
    {
      id: 'body_covering',
      name: 'Penutup Tubuh',
      weight: 0.25,
      features: [
        { id: 'feathers', label: 'Bulu burung terlihat' },
        { id: 'fur', label: 'Rambut atau bulu mamalia terlihat' },
        { id: 'visible_scales', label: 'Sisik terlihat jelas pada permukaan tubuh' },
        { id: 'smooth_bare_skin', label: 'Kulit terbuka berpermukaan relatif halus' },
        { id: 'rough_bare_skin', label: 'Kulit terbuka kasar atau berbintil' },
        { id: 'hard_shell', label: 'Cangkang keras terlihat' },
        { id: 'bony_plates', label: 'Lempeng atau struktur keras bersegmen terlihat' }
      ]
    },
    {
      id: 'locomotion_fins',
      name: 'Alat Gerak & Sirip',
      weight: 0.25,
      features: [
        { id: 'bird_wings', label: 'Sayap burung terlihat (termasuk sayap penguin)' },
        { id: 'two_legs', label: 'Dua kaki terlihat' },
        { id: 'four_legs', label: 'Empat kaki terlihat' },
        { id: 'enlarged_hind_legs', label: 'Kaki belakang tampak lebih besar atau kuat' },
        { id: 'paired_front_fins', label: 'Sepasang sirip dada / depan berbentuk dayung terlihat' },
        { id: 'dorsal_fin', label: 'Sirip punggung terlihat' },
        { id: 'vertical_tail_fin', label: 'Sirip ekor berbentuk vertikal terlihat' },
        { id: 'horizontal_tail_flukes', label: 'Ekor fluke horizontal terlihat' },
        { id: 'external_gills', label: 'Insang luar terlihat' },
        { id: 'gill_slits', label: 'Celah insang terlihat' }
      ]
    },
    {
      id: 'body_shape',
      name: 'Bentuk Tubuh',
      weight: 0.25,
      features: [
        { id: 'elongated_body', label: 'Tubuh terlihat memanjang' },
        { id: 'streamlined_body', label: 'Bentuk tubuh ramping untuk bergerak di air' },
        { id: 'flattened_disc_body', label: 'Tubuh pipih melebar seperti cakram' },
        { id: 'rounded_body', label: 'Tubuh berbentuk bulat atau gempal' },
        { id: 'upright_body', label: 'Orientasi tubuh terlihat tegak' },
        { id: 'long_neck', label: 'Leher terlihat panjang' }
      ]
    },
    {
      id: 'distinctive_structures',
      name: 'Struktur Khas',
      weight: 0.25,
      features: [
        { id: 'bird_beak', label: 'Paruh burung terlihat' },
        { id: 'hooked_beak', label: 'Ujung paruh burung melengkung seperti kait' },
        { id: 'casque', label: 'Struktur tanduk (casque) di atas paruh rangkong' },
        { id: 'owl_facial_disc', label: 'Cakram wajah burung hantu terlihat' },
        { id: 'long_snout', label: 'Moncong terlihat panjang' },
        { id: 'tail_whip', label: 'Ekor panjang menyerupai cambuk terlihat' },
        { id: 'curled_tail', label: 'Ekor melengkung atau melingkar terlihat' },
        { id: 'spines', label: 'Duri pada permukaan tubuh terlihat' },
        { id: 'dorsal_crest', label: 'Jambul atau deretan duri punggung terlihat' },
        { id: 'tubular_snout', label: 'Moncong berbentuk tabung terlihat' }
      ]
    }
  ];

  var ALL_FEATURE_IDS = [];
  FEATURE_GROUPS.forEach(function (g) {
    g.features.forEach(function (f) {
      ALL_FEATURE_IDS.push(f.id);
    });
  });

  function createEmptyFeatures() {
    var obj = {};
    for (var i = 0; i < ALL_FEATURE_IDS.length; i++) {
      obj[ALL_FEATURE_IDS[i]] = null;
    }
    return obj;
  }

  function f(overrides) {
    var out = createEmptyFeatures();
    if (!overrides) return out;
    var keys = Object.keys(overrides);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (Object.prototype.hasOwnProperty.call(out, k)) {
        out[k] = overrides[k];
      }
    }
    return out;
  }

  // Preset dasar agar penutup tubuh & struktur khas yang jelas absen tidak perlu diulang,
  // namun setiap foto tetap diisi secara individual sesuai objek yang terlihat pada foto tersebut.
  function merge(base, specific) {
    var out = f(base);
    if (!specific) return out;
    var keys = Object.keys(specific);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (Object.prototype.hasOwnProperty.call(out, k)) {
        out[k] = specific[k];
      }
    }
    return out;
  }

  var BASE_NONE_STRUCT = {
    bird_beak: 0,
    hooked_beak: 0,
    casque: 0,
    owl_facial_disc: 0,
    long_snout: 0,
    tail_whip: 0,
    curled_tail: 0,
    spines: 0,
    dorsal_crest: 0,
    tubular_snout: 0
  };

  var BASE_AMPHIBIAN_SMOOTH = merge(BASE_NONE_STRUCT, {
    feathers: 0, fur: 0, visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, hard_shell: 0, bony_plates: 0,
    bird_wings: 0, two_legs: 0, paired_front_fins: 0, dorsal_fin: 0, horizontal_tail_flukes: 0, gill_slits: 0,
    flattened_disc_body: 0, upright_body: 0, long_neck: 0
  });

  var BASE_BIRD = merge(BASE_NONE_STRUCT, {
    feathers: 1, fur: 0, visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 0, hard_shell: 0, bony_plates: 0,
    four_legs: 0, enlarged_hind_legs: 0, paired_front_fins: 0, dorsal_fin: 0, vertical_tail_fin: 0,
    horizontal_tail_flukes: 0, external_gills: 0, gill_slits: 0,
    flattened_disc_body: 0, elongated_body: 0, streamlined_body: 0,
    bird_beak: 1
  });

  var BASE_FUR_MAMMAL = merge(BASE_NONE_STRUCT, {
    feathers: 0, fur: 1, visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 0, hard_shell: 0, bony_plates: 0,
    bird_wings: 0, two_legs: 0, enlarged_hind_legs: 0, paired_front_fins: 0, dorsal_fin: 0,
    vertical_tail_fin: 0, horizontal_tail_flukes: 0, external_gills: 0, gill_slits: 0,
    flattened_disc_body: 0, upright_body: 0, long_neck: 0
  });

  var BASE_AQUATIC_MAMMAL = merge(BASE_NONE_STRUCT, {
    feathers: 0, fur: 0, visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, hard_shell: 0, bony_plates: 0,
    bird_wings: 0, two_legs: 0, four_legs: 0, enlarged_hind_legs: 0,
    vertical_tail_fin: 0, external_gills: 0, gill_slits: 0,
    flattened_disc_body: 0, rounded_body: 0, upright_body: 0, long_neck: 0
  });

  var BASE_FISH = merge(BASE_NONE_STRUCT, {
    feathers: 0, fur: 0, hard_shell: 0,
    bird_wings: 0, two_legs: 0, four_legs: 0, enlarged_hind_legs: 0, horizontal_tail_flukes: 0, external_gills: 0,
    long_neck: 0
  });

  var BASE_REPTILE_SCALES = merge(BASE_NONE_STRUCT, {
    feathers: 0, fur: 0, visible_scales: 1, smooth_bare_skin: 0, rough_bare_skin: 0, hard_shell: 0,
    bird_wings: 0, two_legs: 0, enlarged_hind_legs: 0, paired_front_fins: 0, dorsal_fin: 0,
    vertical_tail_fin: 0, horizontal_tail_flukes: 0, external_gills: 0, gill_slits: 0,
    flattened_disc_body: 0, rounded_body: 0, upright_body: 0, long_neck: 0
  });

  var FEATURE_VECTORS = {
    // ================= AMFIBI =================
    // Axolotl 1: seluruh tubuh tampak di air, insang luar jelas, 3 kaki terlihat (1 di balik badan -> four_legs: null), sirip ekor vertikal
    'axolotl-1': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: null, enlarged_hind_legs: 0, vertical_tail_fin: 1, external_gills: 1,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),
    // Axolotl 2: tampak sisi kiri, 2 kaki sisi kiri terlihat, insang luar jelas, ekor bersirip
    'axolotl-2': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: null, enlarged_hind_legs: 0, vertical_tail_fin: 1, external_gills: 1,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),
    // Axolotl 3: tampak samping, 2 kaki sisi kiri terlihat, insang luar merah jelas, ekor bersirip
    'axolotl-3': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: null, enlarged_hind_legs: 0, vertical_tail_fin: 1, external_gills: 1,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),

    // Kadal Air 1: berenang penuh, 4 kaki terlihat, jambul punggung bergerigi, sirip ekor vertikal
    'kadal-air-1': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: 1, enlarged_hind_legs: 0, vertical_tail_fin: 1, external_gills: 0,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0, dorsal_crest: 1
    }),
    // Kadal Air 2: 2 kaki sisi kiri terlihat (sisi kanan tertutup tubuh), ekor pipih vertikal, jambul rendah
    'kadal-air-2': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: null, enlarged_hind_legs: 0, vertical_tail_fin: 1, external_gills: 0,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0, dorsal_crest: 1
    }),
    // Kadal Air 3: tampak samping di batu, kaki sisi kiri & depan kanan terlihat, ekor pipih vertikal, jambul rendah
    'kadal-air-3': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: null, enlarged_hind_legs: 0, vertical_tail_fin: 1, external_gills: 0,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0, dorsal_crest: 1
    }),

    // Salamander 1: tampak atas penuh, 4 kaki jelas, kulit halus mengkilap, tubuh memanjang
    'salamander-1': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: 1, enlarged_hind_legs: 0, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),
    // Salamander 2: tampak samping-depan, bagian belakang buram/terpotong sebagian, kulit halus
    'salamander-2': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: null, enlarged_hind_legs: null, vertical_tail_fin: null, external_gills: 0,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),
    // Salamander 3: melingkar, 4 kaki terlihat (kaki belakang kanan terlihat di sisi kiri), kulit halus mengkilap
    'salamander-3': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: 1, enlarged_hind_legs: 0, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),

    // Kodok 1: kulit agak berbintil/kasar, 4 kaki terlihat (3 jelas), tubuh gempal
    'kodok-1': merge(BASE_AMPHIBIAN_SMOOTH, {
      smooth_bare_skin: 0, rough_bare_skin: 1,
      four_legs: 1, enlarged_hind_legs: 0, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),
    // Kodok 2: kulit sangat kasar/berbintil, kaki depan & belakang terlihat, tubuh gempal
    'kodok-2': merge(BASE_AMPHIBIAN_SMOOTH, {
      smooth_bare_skin: 0, rough_bare_skin: 1,
      four_legs: 1, enlarged_hind_legs: 0, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),
    // Kodok 3 (toad3.jpg): tampak seperti katak hijau licin dengan kaki belakang besar & kuat
    'kodok-3': merge(BASE_AMPHIBIAN_SMOOTH, {
      smooth_bare_skin: 1, rough_bare_skin: 0,
      four_legs: 1, enlarged_hind_legs: 1, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),

    // Katak 1: tampak samping menempel di kaca, 4 kaki terlihat, kaki belakang sangat besar & panjang
    'katak-1': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: 1, enlarged_hind_legs: 1, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),
    // Katak 2: tampak atas-samping, 4 kaki terlihat, kaki belakang kuat terlipat, kulit halus
    'katak-2': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: 1, enlarged_hind_legs: 1, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),
    // Katak 3: di atas air, 4 kaki terlihat, kaki belakang besar terlipat, kulit halus
    'katak-3': merge(BASE_AMPHIBIAN_SMOOTH, {
      four_legs: 1, enlarged_hind_legs: 1, vertical_tail_fin: 0, external_gills: 0,
      elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),

    // ================= AVES =================
    // Elang 1: bertengger sayap terbentang, bulu, sayap, 2 kaki, paruh berkait
    'elang-1': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 1
    }),
    // Elang 2: menyambar air, sayap, 2 kaki bercakar, paruh berkait
    'elang-2': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 0, long_neck: 0, hooked_beak: 1
    }),
    // Elang 3: close-up kepala — sayap dan kaki tidak terlihat (null)
    'elang-3': merge(BASE_BIRD, {
      bird_wings: null, two_legs: null, rounded_body: null, upright_body: null, long_neck: 0, hooked_beak: 1
    }),

    // Flamingo 1: seluruh tubuh, 2 kaki panjang, leher panjang, sayap terlipat, paruh melengkung ke bawah (bukan kait pemangsa)
    'flamingo-1': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 1, hooked_beak: 0
    }),
    // Flamingo 2: close-up kepala & leher — kaki dan sayap tidak terlihat
    'flamingo-2': merge(BASE_BIRD, {
      bird_wings: null, two_legs: null, rounded_body: null, upright_body: null, long_neck: 1, hooked_beak: 0
    }),
    // Flamingo 3: close-up leher & punggung — kaki tidak terlihat, leher panjang & paruh jelas
    'flamingo-3': merge(BASE_BIRD, {
      bird_wings: null, two_legs: null, rounded_body: null, upright_body: null, long_neck: 1, hooked_beak: 0
    }),

    // Rangkong 1: bertengger penuh, sayap, 2 kaki mencengkeram, paruh besar melengkung + casque
    'rangkong-1': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 1, casque: 1
    }),
    // Rangkong 2: close-up kepala & paruh — sayap dan kaki tidak terlihat
    'rangkong-2': merge(BASE_BIRD, {
      bird_wings: null, two_legs: null, rounded_body: null, upright_body: null, long_neck: 0, hooked_beak: 1, casque: 1
    }),
    // Rangkong 3: badan atas, sayap terlihat, kaki terpotong di bawah (null)
    'rangkong-3': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: null, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 1, casque: 1
    }),

    // Burung Hantu 1: tubuh penuh, sayap terlipat, 2 kaki, paruh kait, cakram wajah
    'burung-hantu-1': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 1, owl_facial_disc: 1
    }),
    // Burung Hantu 2: tubuh penuh bertengger, sayap terlipat, 2 kaki, paruh kait, cakram wajah
    'burung-hantu-2': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 1, owl_facial_disc: 1
    }),
    // Burung Hantu 3: terpotong di atas kaki (two_legs: null), sayap terlipat, cakram wajah jelas
    'burung-hantu-3': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: null, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 1, owl_facial_disc: 1
    }),

    // Penguin 1: berdiri penuh, sayap dayung, 2 kaki, tubuh tegak, paruh lurus
    'penguin-1': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 0
    }),
    // Penguin 2: sepasang penguin penuh, sayap dayung, 2 kaki, tubuh tegak
    'penguin-2': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: 1, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 0
    }),
    // Penguin 3: sekelompok penguin, kaki tertutup salju (two_legs: null), sayap dayung & tubuh tegak jelas
    'penguin-3': merge(BASE_BIRD, {
      bird_wings: 1, two_legs: null, rounded_body: 0, upright_body: 1, long_neck: 0, hooked_beak: 0
    }),

    // ================= MAMALIA =================
    // Cheetah 1: berdiri menyamping, 4 kaki, tubuh ramping memanjang
    'cheetah-1': merge(BASE_FUR_MAMMAL, {
      four_legs: 1, elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),
    // Cheetah 2: berlari penuh, 4 kaki, tubuh ramping memanjang
    'cheetah-2': merge(BASE_FUR_MAMMAL, {
      four_legs: 1, elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),
    // Cheetah 3: berdiri di rumput, 4 kaki terlihat, tubuh ramping memanjang
    'cheetah-3': merge(BASE_FUR_MAMMAL, {
      four_legs: 1, elongated_body: 1, streamlined_body: 0, rounded_body: 0
    }),

    // Lumba-lumba 1: close-up kepala (mirip beluga), sirip/ekor/bentuk tubuh tidak terlihat
    'lumba-lumba-1': merge(BASE_AQUATIC_MAMMAL, {
      paired_front_fins: null, dorsal_fin: null, horizontal_tail_flukes: null,
      elongated_body: null, streamlined_body: null
    }),
    // Lumba-lumba 2: melompat, sirip punggung & sirip dada terlihat, ekor di percikan air (null)
    'lumba-lumba-2': merge(BASE_AQUATIC_MAMMAL, {
      paired_front_fins: 1, dorsal_fin: 1, horizontal_tail_flukes: null,
      elongated_body: 0, streamlined_body: 1
    }),
    // Lumba-lumba 3: di dalam air tampak depan-samping, sirip dada & punggung terlihat, ekor di luar frame
    'lumba-lumba-3': merge(BASE_AQUATIC_MAMMAL, {
      paired_front_fins: 1, dorsal_fin: 1, horizontal_tail_flukes: null,
      elongated_body: 0, streamlined_body: 1
    }),

    // Koala 1: seluruh tubuh di cabang, 4 kaki terlihat, tubuh membulat/kompak
    'koala-1': merge(BASE_FUR_MAMMAL, {
      four_legs: 1, elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),
    // Koala 2: close-up bagian atas, kaki bawah terpotong (null)
    'koala-2': merge(BASE_FUR_MAMMAL, {
      four_legs: null, elongated_body: 0, streamlined_body: 0, rounded_body: null
    }),
    // Koala 3: tampak samping, sebagian kaki tertutup cabang (null), tubuh membulat
    'koala-3': merge(BASE_FUR_MAMMAL, {
      four_legs: null, elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),

    // Panda 1: duduk makan bambu, kaki belakang tertutup bambu (null), tubuh gempal
    'panda-1': merge(BASE_FUR_MAMMAL, {
      four_legs: null, elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),
    // Panda 2: tampak depan dari atas, kaki belakang tidak jelas (null)
    'panda-2': merge(BASE_FUR_MAMMAL, {
      four_legs: null, elongated_body: 0, streamlined_body: 0, rounded_body: null
    }),
    // Panda 3: bersandar di lumut, kaki tertutup (null), tubuh gempal
    'panda-3': merge(BASE_FUR_MAMMAL, {
      four_legs: null, elongated_body: 0, streamlined_body: 0, rounded_body: 1
    }),

    // Paus 1: melompat, sirip dada panjang terlihat, punggung & ekor di dalam air (null)
    'paus-1': merge(BASE_AQUATIC_MAMMAL, {
      paired_front_fins: 1, dorsal_fin: null, horizontal_tail_flukes: null,
      elongated_body: 0, streamlined_body: 1
    }),
    // Paus 2: di dalam air penuh, sirip dada, punuk/sirip punggung kecil, dan fluke horizontal terlihat
    'paus-2': merge(BASE_AQUATIC_MAMMAL, {
      paired_front_fins: 1, dorsal_fin: 1, horizontal_tail_flukes: 1,
      elongated_body: 0, streamlined_body: 1
    }),
    // Paus 3: induk & anak di air, sirip dada terlihat, bagian ekor terpotong
    'paus-3': merge(BASE_AQUATIC_MAMMAL, {
      paired_front_fins: 1, dorsal_fin: null, horizontal_tail_flukes: null,
      elongated_body: 0, streamlined_body: 1
    }),

    // ================= PISCES =================
    // Ikan Pari 1: tubuh cakram pipih melebar, sirip dada lebar, ekor cambuk, kulit punggung agak kasar
    'ikan-pari-1': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 1, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 0, vertical_tail_fin: 0, gill_slits: null,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 1, rounded_body: 0, upright_body: 0,
      tail_whip: 1
    }),
    // Ikan Pari 2: tubuh cakram pipih, sirip dada lebar, ekor cambuk tipis terlihat di kanan atas
    'ikan-pari-2': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 0, vertical_tail_fin: 0, gill_slits: null,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 1, rounded_body: 0, upright_body: 0,
      tail_whip: 1
    }),
    // Ikan Pari 3: tubuh cakram pipih, sirip dada lebar, ekor cambuk panjang ke kiri atas
    'ikan-pari-3': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 1, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 0, vertical_tail_fin: 0, gill_slits: null,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 1, rounded_body: 0, upright_body: 0,
      tail_whip: 1
    }),

    // Belut 1: tubuh sangat memanjang, kulit halus, sirip dada kecil & lipatan sirip punggung terlihat
    'belut-1': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 1, vertical_tail_fin: null, gill_slits: null,
      elongated_body: 1, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 0, upright_body: 0
    }),
    // Belut 2: tubuh sangat memanjang melengkung, lipatan sirip punggung-ekor terlihat
    'belut-2': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 1, vertical_tail_fin: null, gill_slits: null,
      elongated_body: 1, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 0, upright_body: 0
    }),
    // Belut 3: tubuh memanjang di atas batu, sirip dada & sirip punggung terlihat
    'belut-3': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 1, vertical_tail_fin: null, gill_slits: null,
      elongated_body: 1, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 0, upright_body: 0
    }),

    // Ikan Buntal 1: mengembang bulat, duri sangat jelas, sirip dada & ekor kecil
    'ikan-buntal-1': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: null, rough_bare_skin: null, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 0, vertical_tail_fin: 1, gill_slits: null,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 1, upright_body: 0,
      spines: 1
    }),
    // Ikan Buntal 2: tampak depan membulat, duri terlihat, sepasang sirip dada terlihat, ekor di belakang (null)
    'ikan-buntal-2': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: null, rough_bare_skin: null, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: null, vertical_tail_fin: null, gill_slits: null,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 1, upright_body: 0,
      spines: 1
    }),
    // Ikan Buntal 3: duri tidak mengembang/tidak terlihat jelas (spines: null), sirip punggung, dada, ekor terlihat
    'ikan-buntal-3': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 1, vertical_tail_fin: 1, gill_slits: null,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 1, upright_body: 0,
      spines: null
    }),

    // Kuda Laut 1: tubuh tegak, lempeng cincin keras, ekor melingkar, moncong tabung, sirip punggung kecil
    'kuda-laut-1': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 0, bony_plates: 1,
      paired_front_fins: 0, dorsal_fin: 1, vertical_tail_fin: 0, gill_slits: 0,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 0, upright_body: 1,
      curled_tail: 1, tubular_snout: 1
    }),
    // Kuda Laut 2: tubuh tegak, lempeng bersegmen, ekor melingkar, moncong tabung, sirip punggung kecil
    'kuda-laut-2': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 0, bony_plates: 1,
      paired_front_fins: 0, dorsal_fin: 1, vertical_tail_fin: 0, gill_slits: 0,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 0, upright_body: 1,
      curled_tail: 1, tubular_snout: 1
    }),
    // Kuda Laut 3: tubuh tegak, lempeng bersegmen, ekor melingkar, moncong tabung, sirip punggung kecil
    'kuda-laut-3': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 0, rough_bare_skin: 0, bony_plates: 1,
      paired_front_fins: 0, dorsal_fin: 1, vertical_tail_fin: 0, gill_slits: 0,
      elongated_body: 0, streamlined_body: 0, flattened_disc_body: 0, rounded_body: 0, upright_body: 1,
      curled_tail: 1, tubular_snout: 1
    }),

    // Hiu 1: tampak depan-bawah, sirip dada & sirip ekor vertikal terlihat, sirip punggung & celah insang tertutup sudut
    'hiu-1': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: null, vertical_tail_fin: 1, gill_slits: null,
      elongated_body: 0, streamlined_body: 1, flattened_disc_body: 0, rounded_body: 0, upright_body: 0
    }),
    // Hiu 2: tampak samping penuh, sirip dada, punggung, ekor vertikal, dan 5 celah insang jelas
    'hiu-2': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 1, vertical_tail_fin: 1, gill_slits: 1,
      elongated_body: 0, streamlined_body: 1, flattened_disc_body: 0, rounded_body: 0, upright_body: 0
    }),
    // Hiu 3: tampak samping penuh, sirip dada, punggung, ekor vertikal, dan celah insang jelas
    'hiu-3': merge(BASE_FISH, {
      visible_scales: 0, smooth_bare_skin: 1, rough_bare_skin: 0, bony_plates: 0,
      paired_front_fins: 1, dorsal_fin: 1, vertical_tail_fin: 1, gill_slits: 1,
      elongated_body: 0, streamlined_body: 1, flattened_disc_body: 0, rounded_body: 0, upright_body: 0
    }),

    // ================= REPTIL =================
    // Buaya 1: tampak depan, sisik & lempeng punggung, moncong panjang, 3 kaki terlihat (1 di belakang tubuh -> null)
    'buaya-1': merge(BASE_REPTILE_SCALES, {
      bony_plates: 1, four_legs: null, elongated_body: 1, streamlined_body: 0, long_snout: 1
    }),
    // Buaya 2: tampak atas penuh, sisik, lempeng punggung, jambul ekor, 4 kaki (3 terlihat + postur lengkap), moncong panjang
    'buaya-2': merge(BASE_REPTILE_SCALES, {
      bony_plates: 1, four_legs: 1, elongated_body: 1, streamlined_body: 0, long_snout: 1, dorsal_crest: 1
    }),
    // Buaya 3: tampak atas penuh, sisik, lempeng punggung, jambul ekor, 4 kaki, moncong panjang
    'buaya-3': merge(BASE_REPTILE_SCALES, {
      bony_plates: 1, four_legs: 1, elongated_body: 1, streamlined_body: 0, long_snout: 1, dorsal_crest: 1
    }),

    // Iguana 1: close-up kepala & leher, sisik & jambul duri punggung jelas, kaki tidak terlihat
    'iguana-1': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: null, elongated_body: null, streamlined_body: 0, dorsal_crest: 1
    }),
    // Iguana 2: badan sebagian di dahan, sisik & jambul punggung jelas, hanya 1 kaki depan terlihat
    'iguana-2': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: null, elongated_body: 1, streamlined_body: 0, dorsal_crest: 1
    }),
    // Iguana 3: close-up kepala & kaki depan, sisik & jambul punggung jelas, kaki belakang tidak jelas
    'iguana-3': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: null, elongated_body: null, streamlined_body: 0, dorsal_crest: 1
    }),

    // Kadal 1: kepala & badan bagian atas, sisik jelas, tubuh memanjang, kaki tidak lengkap terlihat
    'kadal-1': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: null, elongated_body: 1, streamlined_body: 0
    }),
    // Kadal 2: seluruh tubuh tampak samping, sisik, 4 kaki, tubuh memanjang, ekor melingkar ke atas
    'kadal-2': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: 1, elongated_body: 1, streamlined_body: 0, curled_tail: 1
    }),
    // Kadal 3: close-up kepala & leher, sisik jelas, deretan duri kecil di tengkuk, kaki terpotong
    'kadal-3': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: null, elongated_body: null, streamlined_body: 0, dorsal_crest: 1
    }),

    // Ular 1: seluruh tubuh melilit dahan, bersisik, sangat memanjang, jelas tanpa kaki
    'ular-1': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: 0, elongated_body: 1, streamlined_body: 0
    }),
    // Ular 2: seluruh tubuh berkelok, bersisik, sangat memanjang, jelas tanpa kaki
    'ular-2': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: 0, elongated_body: 1, streamlined_body: 0
    }),
    // Ular 3: close-up kepala & gulungan tubuh, bersisik, memanjang, tanpa kaki (sebagian badan terpotong -> four_legs: null)
    'ular-3': merge(BASE_REPTILE_SCALES, {
      bony_plates: 0, four_legs: null, elongated_body: 1, streamlined_body: 0
    }),

    // Penyu 1: tampak atas, cangkang keras, sisik pada kepala & sirip dayung depan, tubuh streamline
    'penyu-1': merge(BASE_REPTILE_SCALES, {
      hard_shell: 1, bony_plates: 0, four_legs: 0, paired_front_fins: 1,
      elongated_body: 0, streamlined_body: 1
    }),
    // Penyu 2: tampak depan-samping berenang, cangkang keras, sisik di sirip & wajah, sepasang sirip dayung depan
    'penyu-2': merge(BASE_REPTILE_SCALES, {
      hard_shell: 1, bony_plates: 0, four_legs: 0, paired_front_fins: 1,
      elongated_body: 0, streamlined_body: 1
    }),
    // Penyu 3: tampak depan-samping di dasar laut, cangkang keras, sisik jelas, sepasang sirip dayung depan
    'penyu-3': merge(BASE_REPTILE_SCALES, {
      hard_shell: 1, bony_plates: 0, four_legs: 0, paired_front_fins: 1,
      elongated_body: 0, streamlined_body: 1
    })
  };

  function get(imageId) {
    return FEATURE_VECTORS[imageId] || null;
  }

  var api = {
    FEATURE_GROUPS: FEATURE_GROUPS,
    ALL_FEATURE_IDS: ALL_FEATURE_IDS,
    FEATURE_VECTORS: FEATURE_VECTORS,
    createEmptyFeatures: createEmptyFeatures,
    get: get
  };

  if (typeof window !== 'undefined') {
    window.FaunaFeatures = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
