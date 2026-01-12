<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('productor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('consumidor_id')->constrained('users')->onDelete('cascade');
            $table->text('ultimo_mensaje')->nullable();
            $table->timestamp('ultimo_mensaje_at')->nullable();
            $table->timestamps();
            
            // Un chat único entre productor y consumidor
            $table->unique(['productor_id', 'consumidor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
