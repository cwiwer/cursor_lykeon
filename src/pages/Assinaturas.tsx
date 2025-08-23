import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Assinaturas = () => {
  const navigate = useNavigate();

  const handleSubscription = (plan: string) => {
    navigate(`/checkout?plan=${plan}`);
  };

  const faqItems = [
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, sem taxas ocultas."
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: "Cartão de crédito, débito e Interac."
    },
    {
      question: "Posso experimentar antes?",
      answer: "Sim, oferecemos 7 dias grátis no primeiro acesso."
    }
  ];

  const mensilBenefits = [
    "Acesso completo às aulas e calendário inteligente",
    "Dashboard dos pais com relatórios semanais",
    "Gamificação (XP, Lumis, conquistas)",
    "Suporte técnico básico"
  ];

  const anualBenefits = [
    ...mensilBenefits,
    "Relatórios mensais em PDF enviados por e-mail",
    "Suporte técnico prioritário",
    "Acesso antecipado a novos recursos"
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-kid-yellow/5 via-background to-kid-blue/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
              Assine a Lykeon e desbloqueie o futuro da educação do seu filho
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Planos flexíveis, benefícios exclusivos e cancelamento fácil.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <Card className="relative border-2 hover:border-kid-green/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-kid-green">Plano Mensal</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$14,90</span>
                  <span className="text-muted-foreground"> CAD/mês</span>
                </div>
                <CardDescription className="text-base mt-2">
                  Perfeito para começar
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
                  Assinar agora
                </Button>
              </CardContent>
            </Card>

            {/* Plano Anual */}
            <Card className="relative border-2 border-kid-orange hover:border-kid-orange/50 transition-all duration-300 hover:shadow-xl shadow-kid-orange/10">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-kid-orange text-white px-6 py-1">
                <Lightbulb className="h-4 w-4 mr-1" />
                Mais popular
              </Badge>
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-kid-orange flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6" />
                  Plano Anual
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$149,00</span>
                  <span className="text-muted-foreground"> CAD/ano</span>
                </div>
                <div className="text-sm text-kid-green font-medium">
                  Economia de ~15%
                </div>
                <CardDescription className="text-base mt-2">
                  Melhor valor para sua família
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
                  Assinar agora
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-kid-green">
              Perguntas Frequentes
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
              Sua assinatura ajuda a Lykeon a continuar transformando a educação. Obrigado pela confiança!
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assinaturas;