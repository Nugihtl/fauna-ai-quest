/* ==========================================================
   Fauna AI Quest — Class Prototype Similarity Engine
   - Pembentukan profil contoh hewan dari 2 foto contoh (abaikan null)
   - Pembentukan prototipe kelas dari label siswa (tanpa trueClass)
   - Jarak Euclidean ternormalisasi per kelompok fitur (bobot 25% per kelompok)
   - Evaluasi terpisah untuk Mode Binary dan Mode Kelompokkan
   ========================================================== */
(function () {
  'use strict';

  function getFeaturesModule() {
    if (typeof window !== 'undefined' && window.FaunaFeatures) return window.FaunaFeatures;
    if (typeof require === 'function') return require('./features.js');
    throw new Error('FaunaFeatures belum dimuat.');
  }

  function isNum(v) {
    return typeof v === 'number' && !isNaN(v);
  }

  /**
   * Menggabungkan array objek fitur (mis. 2 foto contoh dari hewan yang sama)
   * menjadi satu profil fitur rata-rata, mengabaikan nilai null.
   */
  function buildAnimalProfile(featureObjects) {
    var FF = getFeaturesModule();
    var profile = FF.createEmptyFeatures();
    var ids = FF.ALL_FEATURE_IDS;

    for (var i = 0; i < ids.length; i++) {
      var fid = ids[i];
      var sum = 0;
      var count = 0;
      for (var k = 0; k < featureObjects.length; k++) {
        var obj = featureObjects[k];
        if (obj && isNum(obj[fid])) {
          sum += obj[fid];
          count++;
        }
      }
      profile[fid] = count > 0 ? sum / count : null;
    }
    return profile;
  }

  /**
   * Membangun prototipe kelas langsung dari 50 gambar contoh secara independen
   * berdasarkan label pilihan siswa. Tidak pernah membaca classId / trueClass.
   */
  function buildClassPrototypes(sampleImages, studentLabels, classIds, getFeaturesFn) {
    var FF = getFeaturesModule();
    var samplesByClass = {};

    for (var i = 0; i < classIds.length; i++) {
      samplesByClass[classIds[i]] = [];
    }

    for (var s = 0; s < sampleImages.length; s++) {
      var img = sampleImages[s];
      var lbl = studentLabels[img.id];
      if (lbl === undefined || lbl === null || !samplesByClass[lbl]) continue;

      var feat = typeof getFeaturesFn === 'function' ? getFeaturesFn(img.id) : img.features;
      if (!feat) continue;

      samplesByClass[lbl].push(feat);
    }

    var prototypes = {};
    var imageCounts = {};
    var emptyClasses = [];
    var featureIds = FF.ALL_FEATURE_IDS;

    for (var c = 0; c < classIds.length; c++) {
      var cid = classIds[c];
      var classSamples = samplesByClass[cid];
      imageCounts[cid] = classSamples.length;

      if (!classSamples.length) {
        emptyClasses.push(cid);
        prototypes[cid] = null;
        continue;
      }

      var proto = FF.createEmptyFeatures();
      for (var f = 0; f < featureIds.length; f++) {
        var fid = featureIds[f];
        var sum = 0;
        var cnt = 0;
        for (var p = 0; p < classSamples.length; p++) {
          var val = classSamples[p][fid];
          if (isNum(val)) {
            sum += val;
            cnt++;
          }
        }
        proto[fid] = cnt > 0 ? sum / cnt : null;
      }
      prototypes[cid] = proto;
    }

    return {
      prototypes: prototypes,
      imageCounts: imageCounts,
      emptyClasses: emptyClasses
    };
  }

  /**
   * Memprediksi kelas gambar uji berdasarkan kemiripan terhadap prototipe kelas.
   * Hanya menggunakan fitur uji, prototipe, dan konfigurasi kelompok fitur.
   */
  function predictImage(testFeatures, prototypes, options) {
    var FF = getFeaturesModule();
    var opts = options || {};
    var minFeatures = typeof opts.minFeatures === 'number' ? opts.minFeatures : 3;
    var minGroups = typeof opts.minGroups === 'number' ? opts.minGroups : 2;
    var tieTolerance = typeof opts.tieTolerance === 'number' ? opts.tieTolerance : 1e-9;
    var lowMarginThreshold = typeof opts.lowMarginThreshold === 'number' ? opts.lowMarginThreshold : 0.03;

    if (!testFeatures || !prototypes) {
      return {
        status: 'unclassified',
        reason: 'missing_data',
        predictedClass: null,
        similarity: null,
        message: 'Informasi visual belum cukup untuk menentukan prediksi',
        comparableFeatureCount: 0,
        comparableGroupCount: 0,
        distances: {}
      };
    }

    var candidateIds = Object.keys(prototypes).filter(function (cid) {
      return Boolean(prototypes[cid]);
    });

    if (!candidateIds.length) {
      return {
        status: 'unclassified',
        reason: 'empty_prototypes',
        predictedClass: null,
        similarity: null,
        message: 'Prototipe kelas belum tersedia',
        comparableFeatureCount: 0,
        comparableGroupCount: 0,
        distances: {}
      };
    }

    // Kumpulkan fitur yang sama-sama numerik pada gambar uji DAN semua prototipe kandidat
    var comparableByGroup = [];
    var comparableFeatureCount = 0;

    for (var g = 0; g < FF.FEATURE_GROUPS.length; g++) {
      var grp = FF.FEATURE_GROUPS[g];
      var validFeatures = [];

      for (var f = 0; f < grp.features.length; f++) {
        var fid = grp.features[f].id;
        if (!isNum(testFeatures[fid])) continue;

        var allProtosHaveFeature = true;
        for (var c = 0; c < candidateIds.length; c++) {
          if (!isNum(prototypes[candidateIds[c]][fid])) {
            allProtosHaveFeature = false;
            break;
          }
        }

        if (allProtosHaveFeature) {
          validFeatures.push(fid);
          comparableFeatureCount++;
        }
      }

      if (validFeatures.length > 0) {
        comparableByGroup.push({
          id: grp.id,
          name: grp.name,
          weight: grp.weight,
          features: validFeatures
        });
      }
    }

    var comparableGroupCount = comparableByGroup.length;
    if (comparableFeatureCount < minFeatures || comparableGroupCount < minGroups) {
      return {
        status: 'unclassified',
        reason: 'insufficient_features',
        predictedClass: null,
        similarity: null,
        message: 'Informasi visual belum cukup untuk menentukan prediksi',
        comparableFeatureCount: comparableFeatureCount,
        comparableGroupCount: comparableGroupCount,
        distances: {}
      };
    }

    // Hitung jarak Euclidean ternormalisasi per kelompok, lalu rata-rata berbobot antar kelompok
    var distances = {};
    var groupDistancesByClass = {};
    var ranked = [];

    for (var ci = 0; ci < candidateIds.length; ci++) {
      var cid = candidateIds[ci];
      var proto = prototypes[cid];
      var weightedSum = 0;
      var weightTotal = 0;
      groupDistancesByClass[cid] = {};

      for (var gi = 0; gi < comparableByGroup.length; gi++) {
        var cg = comparableByGroup[gi];
        var sqSum = 0;
        for (var fi = 0; fi < cg.features.length; fi++) {
          var key = cg.features[fi];
          var diff = testFeatures[key] - proto[key];
          sqSum += diff * diff;
        }
        var dGroup = Math.sqrt(sqSum / cg.features.length);
        groupDistancesByClass[cid][cg.id] = dGroup;
        weightedSum += dGroup * cg.weight;
        weightTotal += cg.weight;
      }

      var totalDist = weightTotal > 0 ? weightedSum / weightTotal : 1;
      distances[cid] = totalDist;
      ranked.push({ classId: cid, distance: totalDist });
    }

    ranked.sort(function (a, b) {
      return a.distance - b.distance;
    });

    var best = ranked[0];
    var second = ranked[1] || null;

    if (second && Math.abs(second.distance - best.distance) <= tieTolerance) {
      var tiedClasses = ranked
        .filter(function (r) { return Math.abs(r.distance - best.distance) <= tieTolerance; })
        .map(function (r) { return r.classId; });

      return {
        status: 'unclassified',
        reason: 'ambiguous_tie',
        predictedClass: null,
        tiedClasses: tiedClasses,
        similarity: null,
        message: 'Prediksi ambigu karena dua kelas memiliki jarak yang sama',
        comparableFeatureCount: comparableFeatureCount,
        comparableGroupCount: comparableGroupCount,
        distances: distances,
        groupDistances: groupDistancesByClass,
        ranked: ranked
      };
    }

    var similarity = Math.max(0, Math.min(100, (1 - best.distance) * 100));
    var margin = second ? second.distance - best.distance : null;

    return {
      status: 'classified',
      reason: null,
      predictedClass: best.classId,
      distance: best.distance,
      similarity: similarity,
      lowMargin: Boolean(second && margin < lowMarginThreshold),
      margin: margin,
      comparableFeatureCount: comparableFeatureCount,
      comparableGroupCount: comparableGroupCount,
      distances: distances,
      groupDistances: groupDistancesByClass,
      ranked: ranked
    };
  }

  /**
   * Evaluator Mode Binary (membaca trueClass hanya untuk evaluasi setelah prediksi selesai).
   */
  function evaluateBinary(sampleItemsWithTruth, sampleLabels, testItemsWithTruth, predictionsByTestId, targetClassId) {
    var correctSampleLabels = 0;
    for (var i = 0; i < sampleItemsWithTruth.length; i++) {
      var s = sampleItemsWithTruth[i];
      var expectedLabel = s.classId === targetClassId ? 'target' : 'not_target';
      if (sampleLabels[s.id] === expectedLabel) {
        correctSampleLabels++;
      }
    }
    var labelAccuracy = sampleItemsWithTruth.length > 0
      ? (correctSampleLabels / sampleItemsWithTruth.length) * 100
      : 0;

    var tp = 0, tn = 0, fp = 0, fn = 0, unclassifiedCount = 0;
    var details = [];

    for (var j = 0; j < testItemsWithTruth.length; j++) {
      var t = testItemsWithTruth[j];
      var pred = predictionsByTestId[t.id];
      var actualIsTarget = t.classId === targetClassId;
      var predictedIsTarget = pred && pred.status === 'classified' ? pred.predictedClass === 'target' : null;
      var isUnclassified = !pred || pred.status !== 'classified';
      var correct = !isUnclassified && predictedIsTarget === actualIsTarget;

      if (isUnclassified) {
        unclassifiedCount++;
      } else if (actualIsTarget && predictedIsTarget) {
        tp++;
      } else if (!actualIsTarget && !predictedIsTarget) {
        tn++;
      } else if (!actualIsTarget && predictedIsTarget) {
        fp++;
      } else if (actualIsTarget && !predictedIsTarget) {
        fn++;
      }

      details.push({
        id: t.id,
        animalId: t.animalId,
        displayName: t.displayName,
        src: t.src,
        trueClass: t.classId,
        actualIsTarget: actualIsTarget,
        predictedClass: pred ? pred.predictedClass : null,
        predictedIsTarget: predictedIsTarget,
        status: pred ? pred.status : 'unclassified',
        reason: pred ? pred.reason : 'missing_prediction',
        message: pred ? pred.message : null,
        similarity: pred ? pred.similarity : null,
        lowMargin: pred ? Boolean(pred.lowMargin) : false,
        correct: correct
      });
    }

    var totalTest = testItemsWithTruth.length;
    var accuracy = totalTest > 0 ? ((tp + tn) / totalTest) * 100 : 0;
    var recallTarget = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
    var specificity = (tn + fp) > 0 ? (tn / (tn + fp)) * 100 : 0;
    var balancedAccuracy = (recallTarget + specificity) / 2;

    return {
      totalSamples: sampleItemsWithTruth.length,
      correctSampleLabels: correctSampleLabels,
      labelAccuracy: labelAccuracy,
      totalTest: totalTest,
      tp: tp,
      tn: tn,
      fp: fp,
      fn: fn,
      unclassifiedCount: unclassifiedCount,
      accuracy: accuracy,
      recallTarget: recallTarget,
      specificity: specificity,
      balancedAccuracy: balancedAccuracy,
      details: details
    };
  }

  /**
   * Evaluator Mode Kelompokkan (membaca trueClass hanya untuk evaluasi setelah prediksi selesai).
   */
  function evaluateMulticlass(sampleItemsWithTruth, sampleLabels, testItemsWithTruth, predictionsByTestId, classIds) {
    var correctSampleLabels = 0;
    for (var i = 0; i < sampleItemsWithTruth.length; i++) {
      var s = sampleItemsWithTruth[i];
      if (sampleLabels[s.id] === s.classId) {
        correctSampleLabels++;
      }
    }
    var labelAccuracy = sampleItemsWithTruth.length > 0
      ? (correctSampleLabels / sampleItemsWithTruth.length) * 100
      : 0;

    var correctPredictions = 0;
    var wrongPredictions = 0;
    var unclassifiedCount = 0;
    var perClass = {};

    for (var c = 0; c < classIds.length; c++) {
      perClass[classIds[c]] = { total: 0, correct: 0, wrong: 0, unclassified: 0, accuracy: 0 };
    }

    var details = [];
    for (var j = 0; j < testItemsWithTruth.length; j++) {
      var t = testItemsWithTruth[j];
      var pred = predictionsByTestId[t.id];
      var isUnclassified = !pred || pred.status !== 'classified';
      var correct = !isUnclassified && pred.predictedClass === t.classId;

      if (perClass[t.classId]) {
        perClass[t.classId].total++;
      }

      if (isUnclassified) {
        unclassifiedCount++;
        if (perClass[t.classId]) perClass[t.classId].unclassified++;
      } else if (correct) {
        correctPredictions++;
        if (perClass[t.classId]) perClass[t.classId].correct++;
      } else {
        wrongPredictions++;
        if (perClass[t.classId]) perClass[t.classId].wrong++;
      }

      details.push({
        id: t.id,
        animalId: t.animalId,
        displayName: t.displayName,
        src: t.src,
        trueClass: t.classId,
        predictedClass: pred ? pred.predictedClass : null,
        status: pred ? pred.status : 'unclassified',
        reason: pred ? pred.reason : 'missing_prediction',
        message: pred ? pred.message : null,
        similarity: pred ? pred.similarity : null,
        lowMargin: pred ? Boolean(pred.lowMargin) : false,
        correct: correct
      });
    }

    for (var ck = 0; ck < classIds.length; ck++) {
      var cid = classIds[ck];
      var stat = perClass[cid];
      stat.accuracy = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
    }

    var totalTest = testItemsWithTruth.length;
    var predictionAccuracy = totalTest > 0 ? (correctPredictions / totalTest) * 100 : 0;

    return {
      totalSamples: sampleItemsWithTruth.length,
      correctSampleLabels: correctSampleLabels,
      labelAccuracy: labelAccuracy,
      totalTest: totalTest,
      correctPredictions: correctPredictions,
      wrongPredictions: wrongPredictions,
      unclassifiedCount: unclassifiedCount,
      predictionAccuracy: predictionAccuracy,
      perClass: perClass,
      details: details
    };
  }

  var api = {
    buildAnimalProfile: buildAnimalProfile,
    buildClassPrototypes: buildClassPrototypes,
    predictImage: predictImage,
    evaluateBinary: evaluateBinary,
    evaluateMulticlass: evaluateMulticlass
  };

  if (typeof window !== 'undefined') {
    window.FaunaSimilarity = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
