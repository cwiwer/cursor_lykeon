import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Assinaturas = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubscription = (plan: string) => {
    navigate(`/checkout?plan=${plan}`);
  };

  const faqItems = [
    {
      question: t('subscription.faq.cancelQuestion'),
      answer: t('subscription.faq.cancelAnswer')
    },
    {
      question: t('subscription.faq.paymentQuestion'),
      answer: t('subscription.faq.paymentAnswer')
    },
    {
      question: t('subscription.faq.trialQuestion'),
      answer: t('subscription.faq.trialAnswer')
    }
  ];

  const mensilBenefits = t('subscription.benefits.monthly', { returnObjects: true });
  const anualBenefits = [
    ...mensilBenefits,
    ...t('subscription.benefits.annual', { returnObjects: true })
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-kid-yellow/5 via-background to-kid-blue/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
              {t('subscription.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subscription.subtitle')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <Card className="relative border-2 hover:border-kid-green/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-kid-green">{t('subscription.monthlyPlan')}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{t('subscription.monthlyPrice')}</span>
                  <span className="text-muted-foreground"> {t('subscription.monthlyUnit')}</span>
                </div>
                <CardDescription className="text-base mt-2">
                  {t('subscription.monthlyDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {mensilBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-kid-green mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-kid-green hover:bg-kid-green/90 text-white"
                  onClick={() => handleSubscription('mensal')}
                >
                  {t('subscription.signUpNow')}
                </Button>
              </CardContent>
            </Card>

            {/* Plano Anual */}
            <Card className="relative border-2 border-kid-orange hover:border-kid-orange/50 transition-all duration-300 hover:shadow-xl shadow-kid-orange/10">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-kid-orange text-white px-6 py-1">
                <Lightbulb className="h-4 w-4 mr-1" />
                {t('subscription.mostPopular')}
              </Badge>
              <CardHeader className="text-center pb-8 pt-8">
                                  <CardTitle className="text-2xl font-bold text-kid-orange flex items-center justify-center gap-2">
                    <Crown className="h-6 w-6" />
                    {t('subscription.annualPlan')}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{t('subscription.annualPrice')}</span>
                    <span className="text-muted-foreground"> {t('subscription.annualUnit')}</span>
                  </div>
                  <div className="text-sm text-kid-green font-medium">
                    {t('subscription.savings')}
                  </div>
                  <CardDescription className="text-base mt-2">
                    {t('subscription.annualDescription')}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {anualBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-kid-green mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${index >= mensilBenefits.length ? 'font-medium text-kid-orange' : ''}`}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-kid-orange hover:bg-kid-orange/90 text-white"
                  onClick={() => handleSubscription('anual')}
                >
                  {t('subscription.signUpNow')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-kid-green">
              {t('subscription.faqTitle')}
            </h2>
            <div className="grid gap-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="border border-kid-green/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-kid-green mb-2">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trust Footer */}
          <div className="text-center py-8 border-t border-kid-green/20">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {t('subscription.trustFooter')}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assinaturas;