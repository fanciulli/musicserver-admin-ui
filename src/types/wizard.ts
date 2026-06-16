export type WizardStep = {
  image: string;
  text: string;
};

export type Wizard = {
  id: string;
  steps: WizardStep[];
};
