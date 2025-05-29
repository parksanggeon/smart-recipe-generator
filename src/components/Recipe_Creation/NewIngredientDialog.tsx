import React, { useEffect, useState } from 'react';
import {
  Description, Dialog, DialogPanel,
  DialogTitle, DialogBackdrop,
  Button, Input, Field, Label
} from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import pluralize from 'pluralize';
import clsx from 'clsx';
import { call_api } from '../../utils/utils';
import Loading from '../Loading';
import { IngredientDocumentType } from '../../types/index';

interface NewIngredientDialogProps {
  ingredientList: IngredientDocumentType[],
  updateIngredientList: (newIngredient: IngredientDocumentType) => void
}

function NewIngredientDialog({ ingredientList, updateIngredientList }: NewIngredientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ingredientName, setIngredientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setIngredientName('');
    setMessage('');
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIngredientName(e.target.value);
    setMessage('');
    setIsDisabled(false);
  };

  const handleSubmit = async () => {
    if (!ingredientName.trim()) return;
    if (ingredientName.trim().length > 20) {
      setMessage('재료 이름이 너무 깁니다!');
      setIsDisabled(true);
      return;
    }

    const ingredient = ingredientName.trim().toLowerCase();
    const availableIngredients = ingredientList.map(i => i.name.toLowerCase());
    const pluralizedIngredient = pluralize(ingredient);
    const singularizedIngredient = pluralize.singular(ingredient);
    const isAvailable = availableIngredients.includes(ingredient) ||
      availableIngredients.includes(pluralizedIngredient) ||
      availableIngredients.includes(singularizedIngredient);

    if (isAvailable) {
      setMessage('이미 등록된 재료입니다.');
      setIsDisabled(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await call_api({ address: '/api/validate-ingredient', method: 'post', payload: { ingredientName } });
      const { message: responseMessage, error } = response;

      if (error) {
        throw new Error(error);
      }

      if (responseMessage === 'Success') {
        const possibleSuggestions = response.suggested.join(', ');
        setMessage(`성공적으로 추가되었습니다: ${response.newIngredient.name}${possibleSuggestions ? `\n추가 제안: ${possibleSuggestions}` : ''}`);
        updateIngredientList(response.newIngredient);
        setIngredientName('');
      } else if (responseMessage === 'Invalid') {
        const possibleSuggestions = response.suggested.join(', ');
        setMessage(`${ingredientName}은(는) 유효하지 않은 재료입니다.${possibleSuggestions ? `\n다음 제안을 시도해 보세요: ${possibleSuggestions}` : ''}`);
        setIngredientName('');
      } else {
        setMessage(`검증 중 오류가 발생했습니다. 나중에 다시 시도해 주세요: ${responseMessage}`);
        setIngredientName('');
      }
    } catch (error) {
      console.error(error);
      setMessage('재료 추가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
        <PlusCircleIcon className="block mr-2 h-6 w-6" />
        새로운 재료 추가
      </Button>
      <Dialog open={isOpen} onClose={() => { }} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg shadow-lg">
            <DialogTitle className="text-xl font-bold">새로운 재료 추가</DialogTitle>
            <Description className="text-sm text-gray-500">목록에 원하는 재료가 없을 경우, 이름을 입력하세요. 데이터베이스에 추가하기 전 검증을 진행합니다.</Description>
            <Field className="mb-4">
              <Label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700">재료 이름</Label>
              <Input
                type="text"
                id="ingredientName"
                name="ingredientName"
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-black/5 py-1.5 px-3 text-sm/6 text-black',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                )}
                value={ingredientName}
                onChange={handleInputChange}
              />
            </Field>
            <div className="text-red-400 font-bold mb-2" style={{ whiteSpace: 'pre-line' }}>
              <span>{message}</span>
            </div>
            {isLoading ? <Loading /> :
              <div className="flex gap-4 flex-end">
                <Button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400" onClick={() => setIsOpen(false)}>취소</Button>
                <Button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 data-[disabled]:bg-gray-200"
                  onClick={handleSubmit}
                  disabled={!ingredientName.trim() || isDisabled}
                >
                  추가하기
                </Button>
              </div>}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export default NewIngredientDialog;