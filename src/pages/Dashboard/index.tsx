import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');
      setFoods(response.data);
    }
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data } = await api.post('/foods', { ...food, available: true });

      setFoods(oldFoods => [...oldFoods, data]);

      // addToast({
      //   type: 'success',
      //   title: 'Novo prato adicionado',
      //   description: `${food.name} foi adicionado com sucesso`,
      // });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const { data } = await api.put(`/foods/${editingFood.id}`, {
      ...food,
      id: editingFood.id,
      available: true,
    });

    const updatedFoods = foods.map(foodToMap =>
      foodToMap.id === data.id ? data : foodToMap,
    );

    setFoods(updatedFoods);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);

    setFoods(oldFoods => oldFoods.filter(food => food.id !== id));

    // addToast({
    //   type: 'info',
    //   title: 'Prato removido',
    //   description: `O prato foi removido com sucesso`,
    // });
  }

  async function handleUpdateAvailability(food: IFoodPlate): Promise<void> {
    await api.put(`/foods/${food.id}`, food);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleUpdateAvailability={handleUpdateAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
