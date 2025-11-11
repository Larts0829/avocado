import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { bugOutline, medicalOutline } from 'ionicons/icons';
import './Treatments.css';

const Treatments: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('diseases');

  // Disease treatments data
  const diseases = [
    {
      id: 'scab',
      name: 'Scab',
      image: '/images/scab-img.jpg',
      shortDescription: 'Mahalaga ang integrated approach para sa epektibong pamamahala ng avocado scab. Ang paggamit ng disease-resistant varieties ay tumutulong na mabawasan ang impeksyon, habang ang pagpapanatili ng malinis na orchard sa pamamagitan ng pag-alis ng apektadong dahon, prutas, at debris ay pumipigil sa pagkalat ng fungus.',
      fullDescription: 'Ang pagpapatupad ng integrated approach ay mahalaga para sa epektibong pamamahala ng avocado scab. Ang paggamit ng disease-resistant cultivars ay makabuluhang makakabawas sa posibilidad ng impeksyon at mababawasan ang epekto ng sakit sa orchard. Ang pagpapanatili ng mabuting orchard sanitation sa pamamagitan ng pag-alis at pagwasak ng apektadong plant debris, nahulog na dahon, at apektadong prutas ay tumutulong na maalis ang mga potensyal na pinagmumulan ng spores at pumipigil sa pagkalat ng sakit.',
      steps: [
        'Pumitas at itapon ang mga prutas na may scab spots. Huwag iwanan ang mga ito sa ilalim ng puno – ilibing o sunugin (kung pinapayagan) para mapigilan ang pagkalat ng sakit.',
        'Kolektahin at alisin ang nahulog na dahon, sanga, at prutas sa ilalim ng puno. Tumutulong ito na maalis ang fungus na nagdudulot ng scab.',
        'Gupitin ang ilang sanga para makadaan ang hangin at sikat ng araw sa puno. Pinapanatili nitong tuyo ang lugar at hindi kaaya-aya para sa fungus.',
        'Huwag gumamit ng sprinklers na nag-spray ng tubig sa dahon at prutas. Gumamit ng drip irrigation o magdilig sa base ng puno sa halip.',
        'Gumamit ng copper-based fungicide o isa na inirerekomenda ng iyong lokal na agriculture officer. Mag-spray nang pantay sa prutas at dahon, at ulitin tuwing ilang linggo, lalo na sa mga araw ng tag-ulan.',
        'Regular na suriin ang iyong mga prutas ng abokado para sa bagong scab spots. Alisin agad ang mga apektado para mapigilan ang pagkalat.',
        'Bigyan ng sapat na tubig at nutrients ang puno para tumulong itong lumakas at mas lumaban sa mga sakit.'
      ]
    },
    {
      id: 'anthracnose',
      name: 'Anthracnose',
      image: '/images/anthracnose-img.jpg',
      shortDescription: 'Para gamutin ang avocado anthracnose, tumuon sa pagbabawas ng spores at pagprotekta sa prutas. Regular na alisin ang patay na prutas, dahon, at sanga, at linisin ang debris sa ilalim ng puno para mapigilan ang pagkalat ng fungus.',
      fullDescription: 'Ang paggamot sa avocado anthracnose ay nangangailangan ng pagsasaalang-alang ng ilang mga kadahilanan nang sabay. Una, ang iyong layunin ay bawasan ang bilang ng anthracnose spores sa loob at palibot ng iyong puno. Nangangahulugan ito ng pag-alis ng lahat ng patay na prutas, dahon, at sanga sa katapusan ng taon at paglilinis ng anumang debris o nahulog na prutas na maaaring maipon sa ilalim.',
      steps: [
        'Regular na kolektahin at itapon ang patay na prutas, dahon, at sanga mula sa puno.',
        'Linisin ang nahulog na debris sa ilalim ng canopy para mabawasan ang fungal spores sa lupa.',
        'Gupitin ang mga sanga para buksan ang canopy – mas mahusay na airflow ay nagpapababa ng humidity at nagbabawas ng panganib ng sakit.',
        'Kapag nahulog na ang mga bulaklak, magsimulang mag-spray ng copper fungicide para protektahan ang umuunlad na prutas.',
        'Ipagpatuloy ang copper sprays sa dalawang linggong pagitan sa buong panahon ng pag-unlad ng prutas.',
        'Pumitas ng prutas kapag tuyo para mabawasan ang kontaminasyon at pagkalat ng spores.',
        'Iwasan ang pagkasugat o pagkasira ng prutas (ang nasirang prutas ay mas malamang na ma-impeksyon).',
        'Palamigin agad ang na-harvest na prutas at panatilihin sa storage sa humigit-kumulang 5°C para pabagalin ang paglaki ng sakit.'
      ]
    },
    {
      id: 'anthracnose-leaf',
      name: 'Anthracnose sa Dahon',
      image: '/images/anthracnose-leaf-img.jpg',
      shortDescription: 'Mahalaga rin ang pruning. Gupitin ang patay o apektadong dahon at twigs para mapabuti ang air flow sa loob ng puno, na tumutulong na mas mabilis matuyo ang dahon at nagbabawas ng pagkakataon na lumaki ang fungus.',
      fullDescription: 'Mahalaga rin ang pruning. Gupitin ang patay o apektadong dahon at twigs para mapabuti ang air flow sa loob ng puno, na tumutulong na mas mabilis matuyo ang dahon at nagbabawas ng pagkakataon na lumaki ang fungus. Tiyaking linisin ang nahulog na dahon at anumang apektadong plant debris sa palibot ng puno para mapigilan ang pagkalat ng fungus. Mag-spray nang maaga at madalas, simula sa sandaling mapansin mo ang mga palatandaan ng sakit, at ulitin ang aplikasyon tuwing dalawang linggo sa panahon ng tag-ulan para panatilihing malusog ang dahon.',
      steps: [
        'Lakad sa palibot ng puno at hanapin ang mga spot, patay o nagbago ng kulay na dahon, at apektadong twigs.',
        'Gupitin ang patay o malinaw na apektadong dahon at twigs. Gumawa ng malinis na hiwa at alisin ang materyal nang malayo sa puno.',
        'Manipis ang masikip na sanga para makadaan ang hangin sa canopy – tumutulong ito na mas mabilis matuyo ang dahon at nagbabawas ng paglaki ng fungus.',
        'Gamitin ang rake at alisin ang nahulog na dahon at anumang apektadong plant material mula sa ilalim ng puno. Itapon o sunugin ayon sa lokal na patakaran.',
        'Sa sandaling makita mo ang mga palatandaan ng sakit, mag-apply ng inirerekomendang fungicide (hal., copper fungicide) sa foliage.',
        'Mag-apply ulit tuwing dalawang linggo sa panahon ng tag-ulan (o habang nananatiling basa ang kondisyon) para panatilihing protektado ang dahon.',
        'Gamitin ang fungicide nang eksakto ayon sa label. Magsuot ng guwantes, mask, at mahabang manggas kapag nag-spray. Panatilihing malayo ang mga tao at hayop hanggang matuyo ang spray.',
        'Regular na suriin ang puno. Alisin agad ang anumang bagong apektadong dahon at ipagpatuloy ang sprays kung kinakailangan.'
      ]
    },
    {
      id: 'powdery-mildew',
      name: 'Powdery Mildew',
      image: '/images/powderymildew-img.jpg',
      shortDescription: 'Para gamutin ang powdery mildew sa iyong puno ng abokado, magsimula sa pamamagitan ng regular na pag-spray ng mixture ng sulfur fungicide dahil ito ay epektibo at abot-kaya.',
      fullDescription: 'Para gamutin ang powdery mildew sa iyong puno ng abokado, magsimula sa pamamagitan ng regular na pag-spray ng mixture ng sulfur fungicide dahil ito ay epektibo at abot-kaya. Maaari mo ring subukan ang homemade spray sa pamamagitan ng paghahalo ng 1 kutsara ng baking soda at kalahating kutsarita ng liquid soap sa isang galon ng tubig, pagkatapos ay mag-spray sa lahat ng dahon kasama ang ilalim. Tiyaking gupitin ang anumang apektadong dahon o shoots at alisin ang mga ito para hindi kumalat ang fungus.',
      steps: [
        'Gumamit ng sulfur fungicide at mag-spray sa dahon nang regular (sundin ang product label).',
        'Haluin ang 1 tbsp baking soda + ½ tsp liquid soap sa 1 galon (4 L) ng tubig. Mag-spray sa lahat ng dahon, kasama ang ilalim.',
        'Gupitin ang dahon o shoots na may puting pulbos at itapon – huwag i-compost.',
        'Gupitin ang masikip na sanga para makarating ang sikat ng araw at hangin sa dahon.',
        'Mag-spray tuwing linggo sa loob ng 3–4 na linggo o hanggang mawala ang mildew.',
        'Dilig at pakainin nang tama ang puno – ang malusog na puno ay mas lumalaban sa sakit.',
        'Magsuot ng guwantes at mask kapag nag-spray. Panatilihing malayo ang mga bata at hayop hanggang matuyo ang spray.'
      ]
    }
  ];

  // Pest treatments data
  const pests = [
    {
      id: 'persea-mites',
      name: 'Persea Mites (Spider Mites)',
      image: '/images/perseamites-leaf-img.jpg',
      shortDescription: 'Ipinakikita ng pananaliksik na ang heat waves at kakulangan ng pagkain ang mga pangunahing dahilan ng pagbaba ng persea mite, na bumababa ang bilang sa huling bahagi ng tag-init. Ang natural na predators tulad ng Neoseiulus californicus ay tumutulong na kontrolin ang kanilang populasyon.',
      fullDescription: 'Ipinakikita ng pananaliksik na ang heat waves at kakulangan ng pagkain ang mga pangunahing dahilan ng pagbaba ng persea mite, na bumababa ang bilang sa huling bahagi ng tag-init. Ang mataas na temperatura na higit sa 100°F at mababang humidity ay pumapatay sa parehong batang at adult na mites, kaya ang mga inland orchard na may mas mainit at mas tuyong kondisyon ay may mas kaunting infestation. Ang natural na predators tulad ng Euseius hibisci, Galendromus helveolus, at Neoseiulus californicus ay tumutulong na kontrolin ang kanilang populasyon, na ang N. californicus ay ang pinaka-cost-effective at mas hindi nakakasira na opsyon.',
      steps: [
        'Tingnan sa ilalim ng dahon para sa maliliit na dilaw na spot, pinong webbing, o maliliit na gumagalaw na tuldok (mites).',
        'Kung humigit-kumulang kalahati ng dahon ay may mites → oras na para mag-release ng mabubuting mites. Kung humigit-kumulang tatlong-kapat (75%) ng dahon ay apektado → mag-release ulit.',
        'Gumamit ng Neoseiulus californicus – ito ang pinakamahusay na uri at banayad sa puno. Maglagay ng humigit-kumulang 2,000 na mabubuting mites bawat 15-foot na puno.',
        'Para sa malalaking orchard: Haluin ang humigit-kumulang 5,000 na mabubuting mites bawat acre na may kaunting corn grits. Iwisik ito sa basang dahon sa umaga o pagkatapos ng pagdidilig.',
        'Kapag natuyo ang dahon, gigising ang mabubuting mites at magsisimulang kumain ng masasamang mites.',
        'Huwag mag-spray ng insecticides o miticides pagkatapos mag-release ng mabubuting mites – maaari rin nilang patayin ang mga ito. Kung kailangan mong mag-spray, gumamit lamang ng banayad na uri kapag kinakailangan.',
        'Regular na suriin ang mga puno at mag-release ng mas maraming predatory mites lamang kapag tumaas ulit ang bilang ng mites sa action thresholds (humigit-kumulang 50% o 75% ng dahon ang apektado).',
        'Dilig at pakainin nang tama ang iyong mga puno. Ang malusog na puno ay mas nakakayanan ang atake ng mites.',
        'Suriin ang dahon tuwing linggo para makita kung bumababa ang mites. Isulat ang iyong nakikita para malaman mo kung ano ang gumagana.'
      ]
    },
    {
      id: 'borer',
      name: 'Fruit Borers',
      image: '/images/borer-img.jpg',
      shortDescription: 'Para gamutin ang avocado fruit borers, magsimula sa pamamagitan ng pagkolekta at pagwasak ng anumang apektadong prutas na may maliliit na butas o nagpapakita ng palatandaan ng larvae sa loob para mapigilan ang pagkalat ng mga insekto.',
      fullDescription: 'Para gamutin ang avocado fruit borers, magsimula sa pamamagitan ng pagkolekta at pagwasak ng anumang apektadong prutas na may maliliit na butas o nagpapakita ng palatandaan ng larvae sa loob para mapigilan ang pagkalat ng mga insekto. Panatilihing malinis ang lugar sa palibot ng puno sa pamamagitan ng pag-alis ng nahulog na prutas at dahon, dahil maaaring magtago ang mga peste dito. Regular na mag-prune ng puno para mapabuti ang airflow at mas madaling makita ang maagang palatandaan ng infestation.',
      steps: [
        'Kolektahin at sirain ang anumang apektadong prutas na may maliliit na butas o nagpapakita ng palatandaan ng larvae sa loob para mapigilan ang pagkalat ng mga insekto.',
        'Panatilihing malinis ang lugar sa palibot ng puno sa pamamagitan ng pag-alis ng nahulog na prutas at dahon, dahil maaaring magtago ang mga peste dito.',
        'Regular na mag-prune ng puno para mapabuti ang airflow at mas madaling makita ang maagang palatandaan ng infestation.',
        'Sa panahon ng fruiting stage, mag-spray ng organic insecticides tulad ng neem oil o Bacillus thuringiensis (Bt) tuwing 7 hanggang 10 araw para patayin ang larvae at itaboy ang adult moths.',
        'Maaari mo ring balutin ang batang prutas sa paper o cloth bags para pigilan ang borers na mangitlog.',
        'Tuloy-tuloy na monitoring, pagpapanatili ng tamang sanitation, at regular na pag-spray ay tumutulong na panatilihing kontrolado ang avocado fruit borers at protektahan ang iyong ani.'
      ]
    }
  ];

  const renderTreatmentCard = (treatment: typeof diseases[0] | typeof pests[0]) => (
    <IonCard key={treatment.id} className="treatment-card">
      <div className="treatment-image-container">
        <img src={treatment.image} alt={treatment.name} className="treatment-image" />
      </div>
      <IonCardHeader>
        <IonCardTitle>{treatment.name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p className="treatment-short-description">{treatment.shortDescription}</p>
        <IonAccordionGroup>
          <IonAccordion value={`details-${treatment.id}`}>
            <IonItem slot="header">
              <IonLabel>Buong Gabay sa Gamot</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <p className="treatment-full-description">{treatment.fullDescription}</p>
              <h4 className="steps-title">Step-by-Step na Gabay sa Gamot</h4>
              <ol className="treatment-steps">
                {treatment.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </IonAccordion>
        </IonAccordionGroup>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="treatments-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle>Gamot</IonTitle>
          <IonButtons slot="end">
            <img src="/images/logo_snapocado.png" alt="Snapocado" className="toolbar-logo-small" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="treatments-content">
        <div className="treatments-container">
          <div className="category-selector">
            <button
              className={`category-btn ${selectedCategory === 'diseases' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('diseases')}
            >
              <IonIcon icon={medicalOutline} />
              <span>Mga Sakit</span>
            </button>
            <button
              className={`category-btn ${selectedCategory === 'pests' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('pests')}
            >
              <IonIcon icon={bugOutline} />
              <span>Mga Peste</span>
            </button>
          </div>

          {selectedCategory === 'diseases' && (
            <div className="treatments-section">
              <h2 className="section-title">Gamot sa Mga Sakit</h2>
              <p className="section-description">
                Komprehensibong gabay sa gamot para sa karaniwang sakit ng abokado. Sundin ang step-by-step na instruksyon para sa epektibong pamamahala.
              </p>
              <div className="treatments-grid">
                {diseases.map(treatment => renderTreatmentCard(treatment))}
              </div>
            </div>
          )}

          {selectedCategory === 'pests' && (
            <div className="treatments-section">
              <h2 className="section-title">Pamamahala sa Mga Peste</h2>
              <p className="section-description">
                Integrated pest management strategies para sa karaniwang peste ng abokado. Gumamit ng biological controls kung maaari para sa sustainable na solusyon.
              </p>
              <div className="treatments-grid">
                {pests.map(treatment => renderTreatmentCard(treatment))}
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Treatments;