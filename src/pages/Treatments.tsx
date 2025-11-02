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
      shortDescription: 'An integrated approach is important for managing avocado scab effectively. Using disease-resistant varieties helps reduce infection, while keeping the orchard clean by removing infected leaves, fruits, and debris prevents the spread of the fungus.',
      fullDescription: 'Implementing an integrated approach is essential for effectively managing avocado scab. Using disease-resistant cultivars can significantly reduce the likelihood of infection and minimize the disease\'s impact on the orchard. Maintaining good orchard sanitation by removing and destroying infected plant debris, fallen leaves, and affected fruit helps eliminate potential sources of spores and prevents the spread of the disease.',
      steps: [
        'Pick and throw away fruits that have scab spots. Do not leave them under the tree – bury or burn them (if allowed) to stop the disease from spreading.',
        'Collect and remove fallen leaves, branches, and fruits under the tree. This helps get rid of fungus that causes scab.',
        'Trim some branches so air and sunlight can pass through the tree. This keeps the area dry and less friendly for the fungus.',
        'Do not use sprinklers that spray water on the leaves and fruits. Use drip irrigation or water at the base of the tree instead.',
        'Use a copper-based fungicide or one advised by your local agriculture officer. Spray evenly on fruits and leaves, and repeat every few weeks, especially during rainy days.',
        'Check your avocado fruits often for new scab spots. Remove infected ones right away to stop the spread.',
        'Give enough water and nutrients to help the tree grow strong and resist diseases better.'
      ]
    },
    {
      id: 'anthracnose',
      name: 'Anthracnose',
      image: '/images/anthracnose-img.jpg',
      shortDescription: 'To treat avocado anthracnose, focus on reducing spores and protecting the fruit. Remove dead fruits, leaves, and branches regularly, and clean up debris under the tree to stop the spread of the fungus.',
      fullDescription: 'Avocado anthracnose treatment requires keeping several factors in mind at once. First, your goal is to reduce the number of anthracnose spores in and around your tree. This means removing all dead fruits, leaves, and branches at the end of the year and cleaning up any debris or dropped fruits that might accumulate underneath.',
      steps: [
        'Regularly collect and dispose of dead fruits, leaves, and branches from the tree.',
        'Clear up fallen debris beneath the canopy to reduce fungal spores on the ground.',
        'Trim branches to open the canopy – better airflow lowers humidity and reduces disease risk.',
        'Once flowers have dropped, begin spraying a copper fungicide to protect developing fruit.',
        'Continue copper sprays at two-week intervals throughout the fruit development period.',
        'Pick fruits when it\'s dry to minimise contamination and spore spread.',
        'Avoid bruising or damaging fruit (damaged fruit is more likely to get infected).',
        'Cool harvested fruit immediately and keep in storage at about 5°C to slow disease growth.'
      ]
    },
    {
      id: 'anthracnose-leaf',
      name: 'Anthracnose on Leaves',
      image: '/images/anthracnose-leaf-img.jpg',
      shortDescription: 'Pruning is important too. Cut out dead or infected leaves and twigs to improve air flow inside the tree, which helps the leaves dry faster and reduces chances for the fungus to grow.',
      fullDescription: 'Pruning is important too. Cut out dead or infected leaves and twigs to improve air flow inside the tree, which helps the leaves dry faster and reduces chances for the fungus to grow. Make sure to clean up fallen leaves and any infected plant debris around the tree to stop the fungus from spreading. Spray early and often, starting as soon as you notice signs of the disease, and repeat applications every two weeks during the rainy season to keep the leaves healthy.',
      steps: [
        'Walk around the tree and look for spots, dead or discolored leaves, and infected twigs.',
        'Cut out dead or clearly infected leaves and twigs. Make clean cuts and remove material well away from the tree.',
        'Thin crowded branches so air moves through the canopy – this helps leaves dry faster and reduces fungus growth.',
        'Rake and remove fallen leaves and any infected plant material from beneath the tree. Dispose of or burn according to local rules.',
        'As soon as you see disease signs, apply a recommended fungicide (e.g., copper fungicide) to the foliage.',
        'Reapply every two weeks during the rainy season (or while conditions remain wet) to keep leaves protected.',
        'Use the fungicide exactly as labeled. Wear gloves, mask, and long sleeves when spraying. Keep people and animals away until the spray has dried.',
        'Check the tree regularly. Remove any new infected leaves quickly and continue sprays as needed.'
      ]
    },
    {
      id: 'powdery-mildew',
      name: 'Powdery Mildew',
      image: '/images/powderymildew-img.jpg',
      shortDescription: 'To treat powdery mildew on your avocado tree, start by spraying a mixture of sulfur fungicide regularly since it\'s effective and affordable.',
      fullDescription: 'To treat powdery mildew on your avocado tree, start by spraying a mixture of sulfur fungicide regularly since it\'s effective and affordable. You can also try a homemade spray by mixing 1 tablespoon of baking soda and half a teaspoon of liquid soap in a gallon of water, then spray all over the leaves including the undersides. Make sure to prune any infected leaves or shoots and get rid of them so the fungus doesn\'t spread.',
      steps: [
        'Use a sulfur fungicide and spray the leaves regularly (follow the product label).',
        'Mix 1 tbsp baking soda + ½ tsp liquid soap in 1 gallon (4 L) of water. Spray all leaves, including undersides.',
        'Cut off leaves or shoots with white powder and throw them away – do not compost.',
        'Trim crowded branches so sunlight and air can reach the leaves.',
        'Spray every week for 3–4 weeks or until mildew is gone.',
        'Water and feed the tree properly – healthy trees resist disease better.',
        'Wear gloves and a mask when spraying. Keep children and animals away until the spray dries.'
      ]
    }
  ];

  // Pest treatments data
  const pests = [
    {
      id: 'persea-mites',
      name: 'Persea Mites (Spider Mites)',
      image: '/images/perseamites-leaf-img.jpg',
      shortDescription: 'Research shows that heat waves and a lack of food are the main reasons for persea mite decline, with their numbers dropping by late summer. Natural predators like Neoseiulus californicus help control their population.',
      fullDescription: 'Research shows that heat waves and a lack of food are the main reasons for persea mite decline, with their numbers dropping by late summer. High temperatures above 100°F and low humidity kill both young and adult mites, which is why inland orchards with hotter, drier conditions have fewer infestations. Natural predators like Euseius hibisci, Galendromus helveolus, and Neoseiulus californicus help control their population, with N. californicus being the most cost-effective and less damaging option.',
      steps: [
        'Look under the leaves for small yellow spots, fine webbing, or tiny moving dots (mites).',
        'If about half of the leaves have mites → it\'s time to release the good mites. If around three-fourths (75%) of the leaves are infested → release again.',
        'Use Neoseiulus californicus – it\'s the best kind and gentle to the tree. Put about 2,000 good mites per 15-foot tree.',
        'For big orchards: Mix about 5,000 good mites per acre with a little corn grits. Sprinkle this on wet leaves early in the morning or after watering.',
        'When the leaves dry, the good mites wake up and start eating the bad mites.',
        'Don\'t spray insecticides or miticides after releasing good mites – they can kill them too. If you must spray, use mild ones only when needed.',
        'Check trees regularly and release more predatory mites only when mite numbers rise back to the action thresholds (about 50% or 75% of leaves affected).',
        'Water and feed your trees properly. Healthy trees can handle mite attacks better.',
        'Check the leaves every week to see if the mites are going down. Write down what you see so you know what works.'
      ]
    },
    {
      id: 'borer',
      name: 'Fruit Borers',
      image: '/images/borer-img.jpg',
      shortDescription: 'To treat avocado fruit borers, start by collecting and destroying any infested fruits that have small holes or show signs of larvae inside to stop the insects from spreading.',
      fullDescription: 'To treat avocado fruit borers, start by collecting and destroying any infested fruits that have small holes or show signs of larvae inside to stop the insects from spreading. Keep the area around the tree clean by removing fallen fruits and leaves, as these can harbor pests. Prune the tree regularly to improve airflow and make it easier to spot early signs of infestation.',
      steps: [
        'Collect and destroy any infested fruits that have small holes or show signs of larvae inside to stop the insects from spreading.',
        'Keep the area around the tree clean by removing fallen fruits and leaves, as these can harbor pests.',
        'Prune the tree regularly to improve airflow and make it easier to spot early signs of infestation.',
        'During the fruiting stage, spray organic insecticides like neem oil or Bacillus thuringiensis (Bt) every 7 to 10 days to kill larvae and repel adult moths.',
        'You can also wrap young fruits in paper or cloth bags to prevent borers from laying eggs.',
        'Continuously monitor, maintain proper sanitation, and regular spraying help keep avocado fruit borers under control and protect your harvest.'
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
              <IonLabel>Full Treatment Guide</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <p className="treatment-full-description">{treatment.fullDescription}</p>
              <h4 className="steps-title">Step-by-Step Treatment Guide</h4>
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
          <IonTitle>Treatments</IonTitle>
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
              <span>Diseases</span>
            </button>
            <button
              className={`category-btn ${selectedCategory === 'pests' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('pests')}
            >
              <IonIcon icon={bugOutline} />
              <span>Pests</span>
            </button>
          </div>

          {selectedCategory === 'diseases' && (
            <div className="treatments-section">
              <h2 className="section-title">Disease Treatments</h2>
              <p className="section-description">
                Comprehensive treatment guides for common avocado diseases. Follow the step-by-step instructions for effective management.
              </p>
              <div className="treatments-grid">
                {diseases.map(treatment => renderTreatmentCard(treatment))}
              </div>
            </div>
          )}

          {selectedCategory === 'pests' && (
            <div className="treatments-section">
              <h2 className="section-title">Pest Management</h2>
              <p className="section-description">
                Integrated pest management strategies for common avocado pests. Use biological controls when possible for sustainable solutions.
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