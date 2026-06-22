import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import theme from '../../styles/theme';
import { getResponsiveSizeWidth, getResponsiveSizeHeight } from '../../utils/utils';
import MessagesChatbot from '../../components/ChatBotSignUp/MessagesChatbot';
import FlowSignUp from '../../components/ChatBotSignUp/FlowSignUp';
import LoadingScreen from '../../components/LoadingScreen';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { fazerSignUpService } from '../../api/services/usuarioService';

interface message {
   _id: number;
   content: string;
   role: 'assistant' | 'user';
   type: 'text' | 'img' | 'data';
}

const SignUpScreen = ({ navigation }: { navigation: any}) => {
   const scrollViewRef = useRef<ScrollView>(null);
   const [loadingChatbot, setLoadingChatbot] = useState(false);
   const [step, setStep] = useState(0);
   const [answers, setAnswers] = useState<any>({});
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(false);
   const queryClient = useQueryClient();
   let msgBot: message;

   const [messages, setMessages] = useState<{ _id: number, text: string; role: string; }[]>([
      {
         _id: Math.random(),
         text: "Sua jornada está prestes a começar... \n\nPara isso, responda algumas perguntas para entendermos um pouco mais sobre você!",
         role: "assistant",
      }
   ]);

   const { mutateAsync: fazerSignUpServiceFn } = useMutation({
      mutationFn: fazerSignUpService,
      onMutate() {
         setError(false);
         setLoading(true);
      },
      onSuccess(retorno) {
         setLoading(false);
         const token: string = retorno.criarUsuarioResponse?.access_token
         const refreshToken: string = retorno.criarUsuarioResponse?.refresh_token
         queryClient.setQueryData(['usuarioTokens'], () => {
            return {token, refreshToken};
         });
      },
      onError(error) {
         setLoading(false);
         setError(true);
      }
   });

   const handleSignUp = async () => {
      console.log('📝 SignUp iniciado com dados:', answers);
      try {
         const result = await fazerSignUpServiceFn(answers);
         console.log('✅ SignUp sucesso:', result);
      } catch (err) {
         console.error('❌ SignUp erro:', err);
      }
   }

   useEffect(() => {
      const botResponse = {
         _id: Math.random(),
         text: FlowSignUpInstance[step]?.question || "Fim do cadastro!",
         role: "assistant",
      };

      setMessages([...messages, botResponse]);
      setLoadingChatbot(false);   
      if (botResponse.text === "Fim do cadastro!") {
         setTimeout(() => { }, 1000);
         handleSignUp()
      }

   }, [step]);

   useEffect(() => {
      if (error) {
         Alert.alert('Erro', 'Ocorreu um erro ao criar a sua conta. Tente novamente mais tarde.');
         navigation.replace('Boas-Vindas');
      }
   }, [error]);

   const nextQuestion = (userAnswer: any) => {
      setLoadingChatbot(true);
      setAnswers({
         ...answers,
         [FlowSignUpInstance[step]['chave']]: userAnswer
      });

      const userMessage = {
         _id: Math.random(),
         text: (FlowSignUpInstance[step]['chave'] !== 'password'
            ? (userAnswer.toString()).trim()
            : userAnswer.replace(/./g, '*')
         ),
         role: "user",
      };

      setMessages([...messages, userMessage]);

      setTimeout(() => {
         setStep(step + 1);
      }, 1000);
   };

   const FlowSignUpInstance = FlowSignUp(nextQuestion, answers?.password)

   if (loading) {
      return <LoadingScreen loadingMessage='Criando a sua conta...'/>
   }

   return (
      <KeyboardAvoidingView
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         style={styles.container}
         keyboardVerticalOffset={Platform.select({ ios: getResponsiveSizeHeight(10), android: getResponsiveSizeHeight(10) })}
      >
         <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
         >
            {messages.map(message => (
               msgBot = {_id: message._id, content: message.text, role: message.role as  'user' | 'assistant', type: 'text'},
               <MessagesChatbot 
                  key={msgBot._id} 
                  messageObject={msgBot} />
            ))}
         </ScrollView>
         <View style={styles.inputContainer}>
            {loadingChatbot ?
               <ActivityIndicator size={'large'} color={theme.colors.color05} />
               :
               FlowSignUpInstance[step]?.component}
         </View>
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.backgroundColor,
   },
   chatContainer: {
      padding: getResponsiveSizeWidth(5),
   },
   inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveSizeWidth(5),
      borderTopWidth: 1,
      borderColor: theme.colors.color05,
   },
});

export default SignUpScreen;
